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
 * Filters utilities based on selected categories and search query.
 * 
 * @param utilities - The list of utilities to filter.
 * @param selectedCategories - The list of currently selected category IDs.
 * @param searchQuery - The search string to filter by name or building.
 * @effects Returns a filtered array of utilities that match both the category and search criteria.
 */
export const filterUtilities = (utilities: Utility[], selectedCategories: UtilityType[], searchQuery: string): Utility[] => {
  return utilities.filter(
    (u) =>
      selectedCategories.includes(u.type) &&
      (searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.building.toLowerCase().includes(searchQuery.toLowerCase()))
  );
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

  // Get color based on utility status
  const baseColor = utility.status === "reported" ? colors.yellow : colors.blue

  return {
    path: googleMaps.SymbolPath.CIRCLE,
    fillColor: baseColor,
    fillOpacity: 1,
    strokeColor: selectedUtilityId == utility.id ? colors.dark_brown : colors.white, // green outline when selected
    strokeWeight: 2,
    scale: selectedUtilityId == utility.id ? 12 : 8,
  }
}
