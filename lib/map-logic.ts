import { Utility, UtilityType } from "@/components/utility-list"
import { Droplet, Bike, MapPin, AlertCircle, Coffee, Zap, MicrowaveIcon, ParkingCircle, BusFrontIcon } from "lucide-react"

// Categories for filtering utilities 
export const categories = [
  { id: "water", label: "Water Stations", icon: Droplet, color: "text-[#3B82F6]"},
  { id: "microwave", label: "Microwaves", icon: MicrowaveIcon, color: "text-[#8B5CF6]"},
  { id: "bike", label: "Bike Storage", icon: Bike, color: "text-[#10B981]"},
  { id: "emergency", label: "Emergency", icon: AlertCircle, color: "text-[#EF4444]" },
  { id: "food", label: "Food & Drink", icon: Coffee, color: "text-[#F97316]"},
  //{ id: "charging", label: "Charging Stations", icon: Zap, color: "text-[#F59E0B]" },
  { id: "parking", label: "Parking Lots", icon: ParkingCircle, color: "text-yellow-400"},
  { id: "bus", label: "Bus Stops and Stations", icon: BusFrontIcon, color: "text-[#ffffff]"},
  //{ id: "bank", label: "ATMS and Banks", icon: DollarSign, color: "text-[#EC4899]"}
]

export const colors = {
  blue: "#3b82f6", // working
  yellow: "#FFA500", // reported
  dark_brown: "#393424", // selected outline
  white: "#FFFFFF", // default outline
  red: "#b91c1c",
}

/**
 * Toggles the selection of a utility category.
 * 
 * @param currentCategories - The current list of selected categories.
 * @param categoryId - The ID of the category to toggle.
 * @requires categoryId must be a valid UtilityType.
 * @effects Returns a new array with the category toggled (added if missing, removed if present).
 */
export const toggleCategory = (currentCategories: UtilityType[], categoryId: UtilityType): UtilityType[] => {
  return currentCategories.includes(categoryId) 
    ? currentCategories.filter((id) => id !== categoryId) 
    : [...currentCategories, categoryId];
}

/**
 * Retrieves the color associated with a utility category.
 * 
 * @param type - The utility type to get the color for.
 * @requires type is a valid UtilityType.
 * @effects Returns the specific Tailwind CSS color class string associated with the given utility type. 
 *          Returns a default gray color if the type is not found.
 */
export const getCategoryColor = (type: UtilityType): string => {
  return categories.find((cat) => cat.id === type)?.color || "text-gray-400"
}

/**
 * Filters and ranks utilities based on search relevance and category selection.
 * Implements a weighted scoring algorithm to prioritize exact and prefix matches,
 * simulating a professional search engine experience.
 * 
 * @param utilities - The list of utilities to filter.
 * @param selectedCategories - The list of currently selected category IDs.
 * @param searchQuery - The search string to filter utilities by name, building, floor, or type.
 * @effects Returns a sorted array of utilities ranked by relevance score.
 */
export const filterUtilities = (utilities: Utility[], selectedCategories: UtilityType[], searchQuery: string): Utility[] => {
  const normalizedQuery = searchQuery.toLowerCase().trim();
  const hasSelection = selectedCategories.length > 0;
  const hasQuery = normalizedQuery !== "";

  // Optimization: If no search query, simply filter by category (no ranking needed)
  if (!hasQuery) {
     // If no categories selected, return empty (standard behavior to not clutter map)
     if (!hasSelection) return [];
     return utilities.filter(u => selectedCategories.includes(u.type));
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(q => q.length > 0);

  // Relevance Scoring Helper
  // Score 100: Exact Match
  // Score 80: Starts With Query
  // Score 60: Word/Token Starts With Query (e.g. "Tim" in "The Tim Hortons")
  // Score 40: General Substring Match
  // Score 0: No Match
  const getRelevanceScore = (t: string): number => {
    if (!t) return 0;
    
    if (t === normalizedQuery) return 100;
    if (t.startsWith(normalizedQuery)) return 80;
    if (t.split(" ").some(word => word.startsWith(normalizedQuery))) return 60;
    if (t.includes(normalizedQuery)) return 40;
    return 0;
  };

  return utilities
    .map(u => {
      // 1. Scope Constraint: Must match category selection (if specific categories are active)
      // If no categories selected (Global Search), this check is bypassed (true).
      const isInScope = hasSelection ? selectedCategories.includes(u.type) : true;
      
      if (!isInScope) return { utility: u, score: -1 };

      // Pre-calculate lowercased fields to allow reuse in fullText and scoring matching
      const nameL = u.name.toLowerCase();
      const buildingL = u.building.toLowerCase();
      const floorL = (u.floor || "").toLowerCase();
      const typeL = u.type.toLowerCase();

      // 2. Relevance Calculation
      // We calculate scores for all searchable fields: Name, Building, Floor (Description), Type
      let score = 0;

      // Calculate individual field scores for the full query string.
      // This ensures exact matches like "Chemistry Lab" in name field get score 100,
      // even for multi-term queries.
      const nameScore = getRelevanceScore(nameL);
      const buildingScore = getRelevanceScore(buildingL);
      const floorScore = getRelevanceScore(floorL); 
      const typeScore = getRelevanceScore(typeL);

      // Apply field weights: Name (1.0), Building (0.9), Type (0.8), Floor (0.7)
      // This ensures that for the same match quality, fields are prioritized correctly
      const individualScore = Math.max(
        nameScore, 
        Math.floor(buildingScore * 0.9),
        Math.floor(typeScore * 0.8),
        Math.floor(floorScore * 0.7) 
      );

      score = individualScore;

      // For multi-term queries, also check composite cross-field matches
      // (e.g. "broken chemistry" where "broken" is in name and "chemistry" is in building)
      if (queryTerms.length > 1) {
         // Create a composite string of all searchable text for this item
         const fullText = `${nameL} ${buildingL} ${floorL} ${typeL}`;
         // Check if EVERY search term appears SOMEWHERE in that composite string
         if (queryTerms.every(term => fullText.includes(term))) {
             // Use composite score only if it's better than individual field score
             // This ensures "Chemistry Lab" exact match (100) beats composite match (80)
             score = Math.max(score, 80);
         }
      }

      return { utility: u, score: score };
    })
    .filter(item => item.score > 0)     // Filter out non-matches
    .sort((a, b) => b.score - a.score)  // Sort by score descending (Best match first)
    .map(item => item.utility);         // Extract/Flatten back to Utility[]
}

/**
 * Generates the marker icon configuration for a utility.
 * 
 * @param utility - The utility object to generate the icon for.
 * @param selectedUtilityId - The ID of the currently selected utility (or null).
 * @param googleMaps - The window.google.maps object (dependency injection for testing).
 * @requires utility is a valid object. googleMaps is a valid Google Maps API object.
 * @effects Returns a google.maps.Symbol object defining the marker's visual appearance.
 */
export const getMarkerIcon = (utility: Utility, selectedUtilityId: string | null | undefined, googleMaps: any) => {
  if (!googleMaps) {
    return undefined
  }
  let baseColor = colors.blue;
  // Get color based on utility status
  // Yellow (Reported / Warning)
  if (utility.status === "reported") {
    baseColor = colors.yellow; 
  } 
  // Red (Broken / Avoid)
  else if (utility.status === "broken") {
    baseColor = colors.red; 
  }
  // Grey (Maintenance)
  else if (utility.status === "maintenance") {
    baseColor = "#6B7280"; 
  }
  return {
    path: googleMaps.SymbolPath.CIRCLE,
    fillColor: baseColor,
    fillOpacity: 1,
    strokeColor: selectedUtilityId == utility.id ? colors.dark_brown : colors.white, // outline when selected
    strokeWeight: 2,
    scale: selectedUtilityId == utility.id ? 12 : 8,
  }
}
