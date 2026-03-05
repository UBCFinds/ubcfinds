import { Utility, UtilityType } from "@/components/utility-list"
import { Droplet, Bike, MapPin, AlertCircle, Coffee, Zap, MicrowaveIcon, ParkingCircle, BusFrontIcon } from "lucide-react"

export const categories = [
  { id: "water", label: "Water Stations", icon: Droplet, color: "text-[#3B82F6]"},
  { id: "microwave", label: "Microwaves", icon: MicrowaveIcon, color: "text-[#8B5CF6]"},
  { id: "bike", label: "Bike Storage", icon: Bike, color: "text-[#10B981]"},
  { id: "emergency", label: "Emergency", icon: AlertCircle, color: "text-[#EF4444]" },
  { id: "food", label: "Food & Drink", icon: Coffee, color: "text-[#F97316]"},
  { id: "parking", label: "Parking Lots", icon: ParkingCircle, color: "text-yellow-400"},
  { id: "bus", label: "Bus Stops and Stations", icon: BusFrontIcon, color: "text-[#ffffff]"}
]

export const colors = {
  blue: "#3b82f6",
  yellow: "#FFA500",
  dark_brown: "#393424",
  white: "#FFFFFF",
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

  if (!hasQuery) {
    if (!hasSelection) return [];
    return utilities.filter(u => selectedCategories.includes(u.type));
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(q => q.length > 0);

  // Scores: 100 exact, 80 starts-with, 60 word-starts-with, 40 substring
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
      const isInScope = hasSelection ? selectedCategories.includes(u.type) : true;
      if (!isInScope) return { utility: u, score: -1 };

      const nameL = u.name.toLowerCase();
      const buildingL = u.building.toLowerCase();
      const floorL = (u.floor || "").toLowerCase();
      const typeL = u.type.toLowerCase();

      const nameScore = getRelevanceScore(nameL);
      const buildingScore = getRelevanceScore(buildingL);
      const floorScore = getRelevanceScore(floorL);
      const typeScore = getRelevanceScore(typeL);

      // Name counts most, then building, type, floor
      let score = Math.max(
        nameScore,
        Math.floor(buildingScore * 0.9),
        Math.floor(typeScore * 0.8),
        Math.floor(floorScore * 0.7)
      );

      // Multi-term: boost if every term appears somewhere (e.g. "broken chemistry" across name + building)
      if (queryTerms.length > 1) {
        const fullText = `${nameL} ${buildingL} ${floorL} ${typeL}`;
        if (queryTerms.every(term => fullText.includes(term))) {
          score = Math.max(score, 80);
        }
      }

      return { utility: u, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.utility);
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
  if (!googleMaps) return undefined;

  let baseColor = colors.blue;
  if (utility.status === "reported") baseColor = colors.yellow;
  else if (utility.status === "broken") baseColor = colors.red;
  else if (utility.status === "maintenance") baseColor = "#6B7280";

  const selected = selectedUtilityId === utility.id;
  return {
    path: googleMaps.SymbolPath.CIRCLE,
    fillColor: baseColor,
    fillOpacity: 1,
    strokeColor: selected ? colors.dark_brown : colors.white,
    strokeWeight: 2,
    scale: selected ? 12 : 8,
  };
}
