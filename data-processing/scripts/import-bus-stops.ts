import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UBC Campus Bounds
const UBC_BOUNDS = {
  north: 49.292569,
  south: 49.236203,
  east: -123.195687,
  west: -123.285719,
};

// Existing bus stops in utility-list.ts (IDs 274-284)
const EXISTING_BUS_STOPS = [
  { lat: 49.26741, lng: -123.24795 },  // UBC Exchange @ Bay 1
  { lat: 49.2673, lng: -123.24828 },   // UBC Exchange @ Bay 2
  { lat: 49.26717, lng: -123.24864 },  // UBC Exchange @ Bay 3
  { lat: 49.26703, lng: -123.24895 },  // UBC Exchange @ Bay 4
  { lat: 49.26683, lng: -123.24928 },  // UBC Exchange @ Bay 5
  { lat: 49.26673, lng: -123.24958 },  // UBC Exchange @ Bay 6
  { lat: 49.26659, lng: -123.24988 },  // UBC Exchange @ Bay 7
  { lat: 49.26637, lng: -123.2502 },   // UBC Exchange @ Bay 8
  { lat: 49.26622, lng: -123.25015 },  // UBC Exchange @ Bay 9
  { lat: 49.26603, lng: -123.24824 },  // UBC Exchange @ Bay 10
  { lat: 49.26591, lng: -123.24736 },  // UBC Exchange @ Bay 11
];

const COORDINATE_TOLERANCE = 0.0001; // ~11 meters

interface Stop {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

interface Utility {
  id: string;
  name: string;
  type: "bus";
  building: string;
  floor: string;
  position: { lat: number; lng: number };
  status: "working";
  reports: number;
  lastChecked: string;
}

// Check if coordinates are within UBC bounds
function isWithinUBCBounds(lat: number, lng: number): boolean {
  return (
    lat >= UBC_BOUNDS.south &&
    lat <= UBC_BOUNDS.north &&
    lng >= UBC_BOUNDS.west &&
    lng <= UBC_BOUNDS.east
  );
}

// Check if stop already exists in utility-list.ts
function isExistingStop(lat: number, lng: number): boolean {
  return EXISTING_BUS_STOPS.some(
    (stop) =>
      Math.abs(stop.lat - lat) < COORDINATE_TOLERANCE &&
      Math.abs(stop.lng - lng) < COORDINATE_TOLERANCE
  );
}

// Parse routes.txt to get route_id -> route_short_name mapping
async function parseRoutes(routesPath: string): Promise<Map<string, string>> {
  const routeMap = new Map<string, string>();
  const fileStream = fs.createReadStream(routesPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    const parts = line.split(',');
    if (parts.length >= 3) {
      const routeId = parts[0];
      const routeShortName = parts[2];
      if (routeShortName && routeShortName.trim()) {
        routeMap.set(routeId, routeShortName);
      }
    }
  }

  console.log(`Parsed ${routeMap.size} routes`);
  return routeMap;
}

// Parse trips.txt to get trip_id -> route_id mapping
async function parseTrips(tripsPath: string): Promise<Map<string, string>> {
  const tripMap = new Map<string, string>();
  const fileStream = fs.createReadStream(tripsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    const parts = line.split(',');
    if (parts.length >= 3) {
      const routeId = parts[0];
      const tripId = parts[2];
      tripMap.set(tripId, routeId);
    }
  }

  console.log(`Parsed ${tripMap.size} trips`);
  return tripMap;
}

// Parse stop_times.txt to get stop_id -> Set<route_id> mapping
async function parseStopTimes(
  stopTimesPath: string,
  tripToRoute: Map<string, string>
): Promise<Map<string, Set<string>>> {
  const stopRoutes = new Map<string, Set<string>>();
  const fileStream = fs.createReadStream(stopTimesPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  let linesProcessed = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    linesProcessed++;
    if (linesProcessed % 100000 === 0) {
      console.log(`Processed ${linesProcessed} stop times...`);
    }

    const parts = line.split(',');
    if (parts.length >= 4) {
      const tripId = parts[0];
      const stopId = parts[3];

      const routeId = tripToRoute.get(tripId);
      if (routeId) {
        if (!stopRoutes.has(stopId)) {
          stopRoutes.set(stopId, new Set<string>());
        }
        stopRoutes.get(stopId)!.add(routeId);
      }
    }
  }

  console.log(`Parsed ${linesProcessed} stop times for ${stopRoutes.size} unique stops`);
  return stopRoutes;
}

// Format route names for building field
function formatRoutes(routeIds: Set<string>, routeMap: Map<string, string>): string {
  const routeNames = Array.from(routeIds)
    .map((id) => routeMap.get(id))
    .filter((name): name is string => !!name)
    .sort((a, b) => {
      // Numeric sort
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  if (routeNames.length === 0) {
    return '';
  } else if (routeNames.length === 1) {
    return `Route ${routeNames[0]}`;
  } else {
    return `Routes ${routeNames.join(', ')}`;
  }
}

// Parse stops.txt and filter for UBC area
async function parseStops(
  stopsPath: string,
  stopRoutes: Map<string, Set<string>>,
  routeMap: Map<string, string>
): Promise<Utility[]> {
  const utilities: Utility[] = [];
  const fileStream = fs.createReadStream(stopsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  let nextId = 285;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    const parts = line.split(',');
    if (parts.length >= 6) {
      const stopId = parts[0];
      const stopName = parts[2];
      const stopLat = parseFloat(parts[4]);
      const stopLon = parseFloat(parts[5]);

      // Check if within UBC bounds
      if (!isWithinUBCBounds(stopLat, stopLon)) {
        continue;
      }

      // Check if already exists
      if (isExistingStop(stopLat, stopLon)) {
        console.log(`Skipping existing stop: ${stopName}`);
        continue;
      }

      // Get routes for this stop
      const routeIds = stopRoutes.get(stopId) || new Set<string>();
      const building = formatRoutes(routeIds, routeMap);

      const utility: Utility = {
        id: nextId.toString(),
        name: stopName,
        type: 'bus',
        building: building,
        floor: '',
        position: { lat: stopLat, lng: stopLon },
        status: 'working',
        reports: 0,
        lastChecked: '21/01/2026',
      };

      utilities.push(utility);
      nextId++;
    }
  }

  console.log(`Found ${utilities.length} new bus stops within UBC bounds`);
  return utilities;
}

// Generate output file
function generateOutput(utilities: Utility[], outputPath: string): void {
  const content = `// Auto-generated TransLink bus stops for UBC campus
// Generated on: ${new Date().toISOString()}
// Total stops: ${utilities.length}

import { Utility } from '../../components/utility-list';

export const newBusStops: Utility[] = [
${utilities
  .map(
    (u) => `  {
    id: "${u.id}",
    name: "${u.name}",
    type: "bus",
    building: "${u.building}",
    floor: "",
    position: { lat: ${u.position.lat}, lng: ${u.position.lng} },
    status: "working",
    reports: 0,
    lastChecked: "${u.lastChecked}",
  }`
  )
  .join(',\n')}
];
`;

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\nOutput written to: ${outputPath}`);
}

// Main function
async function main() {
  const transitDir = path.join(__dirname, '../source-data/google_transit');
  const outputPath = path.join(__dirname, 'import-bus-stops-output.ts');

  console.log('Starting TransLink bus stop import...\n');

  try {
    // Step 1: Parse routes
    console.log('Step 1: Parsing routes.txt...');
    const routeMap = await parseRoutes(path.join(transitDir, 'routes.txt'));

    // Step 2: Parse trips
    console.log('\nStep 2: Parsing trips.txt...');
    const tripMap = await parseTrips(path.join(transitDir, 'trips.txt'));

    // Step 3: Parse stop times
    console.log('\nStep 3: Parsing stop_times.txt (this may take a while)...');
    const stopRoutes = await parseStopTimes(path.join(transitDir, 'stop_times.txt'), tripMap);

    // Step 4: Parse stops and generate utilities
    console.log('\nStep 4: Parsing stops.txt and filtering for UBC...');
    const utilities = await parseStops(
      path.join(transitDir, 'stops.txt'),
      stopRoutes,
      routeMap
    );

    // Step 5: Generate output
    console.log('\nStep 5: Generating output file...');
    generateOutput(utilities, outputPath);

    console.log('\n✓ Import complete!');
    console.log(`  - Total new stops: ${utilities.length}`);
    console.log(`  - ID range: 285-${284 + utilities.length}`);
    console.log(`\nNext step: Review ${outputPath} and copy the array into utility-list.ts`);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();
