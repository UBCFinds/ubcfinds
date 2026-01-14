import { toggleCategory, getCategoryColor, filterUtilities, getMarkerIcon, categories, colors } from "@/lib/map-logic"
import { Utility, UtilityType } from "@/components/utility-list"

// Mock data
const mockUtilities: Utility[] = [
  {
    id: "1",
    name: "Water Fountain",
    type: "water",
    building: "Nest",
    floor: "1",
    position: { lat: 0, lng: 0 },
    status: "working",
    reports: 0,
    lastChecked: "2023-01-01"
  },
  {
    id: "2",
    name: "Microwave",
    type: "microwave",
    building: "Life",
    floor: "2",
    position: { lat: 0, lng: 0 },
    status: "working",
    reports: 0,
    lastChecked: "2023-01-01"
  },
  {
    id: "3",
    name: "Broken Fountain",
    type: "water",
    building: "Chemistry",
    floor: "1",
    position: { lat: 0, lng: 0 },
    status: "reported",
    reports: 5,
    lastChecked: "2023-01-01"
  }
]

describe("Map Logic", () => {
  
  describe("toggleCategory", () => {
    it("should add a category if not present", () => {
      const current: UtilityType[] = ["water"]
      const result = toggleCategory(current, "microwave")
      expect(result).toEqual(["water", "microwave"])
    })

    it("should remove a category if present", () => {
      const current: UtilityType[] = ["water", "microwave"]
      const result = toggleCategory(current, "water")
      expect(result).toEqual(["microwave"])
    })
  })

  describe("getCategoryColor", () => {
    it("should return the correct color for a known category", () => {
      const color = getCategoryColor("water")
      const expectedColor = categories.find(c => c.id === "water")?.color
      expect(color).toBe(expectedColor)
    })

    it("should return default color for unknown category", () => {
      // @ts-ignore - testing invalid input
      const color = getCategoryColor("unknown")
      expect(color).toBe("text-gray-400")
    })
  })

  describe("filterUtilities", () => {
    it("should filter by category", () => {
      const selected: UtilityType[] = ["water"]
      const result = filterUtilities(mockUtilities, selected, "")
      expect(result).toHaveLength(2)
      expect(result.every(u => u.type === "water")).toBe(true)
    })

    it("should filter by search query (name)", () => {
      const selected: UtilityType[] = ["water", "microwave"]
      const result = filterUtilities(mockUtilities, selected, "Fountain")
      expect(result).toHaveLength(2) // Water Fountain and Broken Fountain
    })

    it("should filter by search query (building)", () => {
      const selected: UtilityType[] = ["water", "microwave"]
      const result = filterUtilities(mockUtilities, selected, "Life")
      expect(result).toHaveLength(1)
      expect(result[0].building).toBe("Life")
    })

    it("should filter by both category and search", () => {
      const selected: UtilityType[] = ["water"]
      const result = filterUtilities(mockUtilities, selected, "Chemistry")
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Broken Fountain")
    })

    it("should return empty if no match", () => {
      const selected: UtilityType[] = ["water"]
      const result = filterUtilities(mockUtilities, selected, "Space Station")
      expect(result).toHaveLength(0)
    })
  })

  describe("getMarkerIcon", () => {
    const mockGoogleMaps = {
      SymbolPath: {
        CIRCLE: "CIRCLE"
      }
    }

    it("should return undefined if google maps is not provided", () => {
      const result = getMarkerIcon(mockUtilities[0], null, null)
      expect(result).toBeUndefined()
    })

    it("should return correct icon for working utility", () => {
      const result = getMarkerIcon(mockUtilities[0], null, mockGoogleMaps)
      expect(result).toEqual({
        path: "CIRCLE",
        fillColor: colors.blue,
        fillOpacity: 1,
        strokeColor: colors.white,
        strokeWeight: 2,
        scale: 8
      })
    })

    it("should return correct icon for reported utility", () => {
      const result = getMarkerIcon(mockUtilities[2], null, mockGoogleMaps)
      expect(result).toEqual({
        path: "CIRCLE",
        fillColor: colors.yellow,
        fillOpacity: 1,
        strokeColor: colors.white,
        strokeWeight: 2,
        scale: 8
      })
    })

    it("should return correct icon for selected utility", () => {
      const result = getMarkerIcon(mockUtilities[0], "1", mockGoogleMaps)
      expect(result).toEqual({
        path: "CIRCLE",
        fillColor: colors.blue,
        fillOpacity: 1,
        strokeColor: colors.dark_brown,
        strokeWeight: 2,
        scale: 12
      })
    })
  })
})
