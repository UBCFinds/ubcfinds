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
    floor: "Lower Level Basement",
    position: { lat: 0, lng: 0 },
    status: "working",
    reports: 0,
    lastChecked: "2023-01-01"
  },
  {
    id: "3",
    name: "Broken Fountain",
    type: "water",
    building: "Chemistry Block B", // Modified to be "Starts With" match, not "Exact" match
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
    it("Global Search: Should search all categories when no category is selected", () => {
      // Case 1: No query, no selection -> Empty (Map cleanup)
      expect(filterUtilities(mockUtilities, [], "")).toHaveLength(0)

      // Case 2: Query "Nest", no selection -> Should find items in Nest across categories
      const results = filterUtilities(mockUtilities, [], "Nest")
      expect(results).toHaveLength(1)
      expect(results[0].building).toBe("Nest")
    })

    it("Multi-Term Query: Should match 'broken chemistry' across fields", () => {
      const results = filterUtilities(mockUtilities, [], "broken chemistry")
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe("3") // Broken Fountain in Chemistry
    })

    it("Deep Property Search: Should search in floor/description", () => {
        // Search for "Basement" which is only in the floor/desc field of item 2
        const results = filterUtilities(mockUtilities, [], "Basement")
        
        expect(results).toHaveLength(1)
        expect(results[0].id).toBe("2")
        expect(results[0].floor).toContain("Basement")
    })
    
    it("Deep Property Search: Should search in Type", () => {
        // Searching "microwave" should find the Microwave item
        const results = filterUtilities(mockUtilities, [], "microwave")
        expect(results).toHaveLength(1)
        expect(results[0].name).toBe("Microwave")
    })

    it("Relevance Ranking: Name match should prioritize over lower matches", () => {
      // Add a conflicting item
      const rankedMock = [
          ...mockUtilities,
          {
            id: "4", name: "Chemistry Lab", type: "water", building: "Other", floor: "", 
            position: {lat:0,lng:0}, status: "working", reports: 0, lastChecked: ""
          }
      ] as Utility[]

      // Search "Chemistry"
      // Item 3: "Broken Fountain" (Building match = Chemistry) -> Score ~79 (80-1)
      // Item 4: "Chemistry Lab" (Name match = Chemistry) -> Score 80 (Starts with)
      
      const results = filterUtilities(rankedMock, [], "Chemistry")
      expect(results[0].name).toBe("Chemistry Lab")
    })

    it("Edge Case: Empty strings after trim should return empty if no category", () => {
        expect(filterUtilities(mockUtilities, [], "   ")).toHaveLength(0)
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
