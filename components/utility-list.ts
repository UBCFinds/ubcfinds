
// Defines what types of utilities are available and their structure
export type UtilityType = "water" | "bike" | "washroom" | "emergency" | "food" | "charging" | "microwave" | "bus" | "bank"


// Defines Utility data structure
export interface Utility {
    id: string
    name: string
    type: UtilityType
    building: string
    floor: string
    position: { lat: number; lng: number }
    status: "working" | "reported" | "maintenance"
    reports: number
    lastChecked: string
  }

export const mockUtilities: Utility[] = [
    {
      id: "1",
      name: "Water Fountain",
      type: "water",
      building: "ICICS",
      floor: "2nd Floor",
      position: { lat: 49.2611, lng: -123.2489 },
      status: "working",
      reports: 0,
      lastChecked: "2 hours ago",
    },
    {
      id: "2",
      name: "Bike Cage",
      type: "bike",
      building: "Main Mall",
      floor: "Ground",
      position: { lat: 49.2606, lng: -123.246 },
      status: "working",
      reports: 0,
      lastChecked: "1 day ago",
    },
    {
      id: "3",
      name: "Accessible Washroom",
      type: "washroom",
      building: "Nest",
      floor: "1st Floor",
      position: { lat: 49.2667, lng: -123.25 },
      status: "working",
      reports: 0,
      lastChecked: "3 hours ago",
    },
    {
      id: "4",
      name: "Emergency Phone",
      type: "emergency",
      building: "Library",
      floor: "Outside",
      position: { lat: 49.2677, lng: -123.2563 },
      status: "working",
      reports: 0,
      lastChecked: "1 week ago",
    },
    {
      id: "5",
      name: "Water Bottle Refill",
      type: "water",
      building: "ESB",
      floor: "1st Floor",
      position: { lat: 49.2625, lng: -123.2492 },
      status: "reported",
      reports: 2,
      lastChecked: "5 hours ago",
    },
    {
      id: "6",
      name: "Bike Repair Station",
      type: "bike",
      building: "Student Union",
      floor: "Outside",
      position: { lat: 49.265, lng: -123.2515 },
      status: "working",
      reports: 0,
      lastChecked: "2 days ago",
    },
    {
      id: "7",
      name: "Coffee Shop",
      type: "food",
      building: "Life Sciences",
      floor: "Ground",
      position: { lat: 49.2638, lng: -123.2528 },
      status: "working",
      reports: 0,
      lastChecked: "1 hour ago",
    },
    {
      id: "8",
      name: "Charging Station",
      type: "charging",
      building: "Nest",
      floor: "2nd Floor",
      position: { lat: 49.2668, lng: -123.2498 },
      status: "working",
      reports: 0,
      lastChecked: "4 hours ago",
    },
    {
      id: "9",
      name: "Microwave 1",
      type: "microwave",
      building: "Marine Drive 2",
      floor: "floor 4",
      position: {lat: 49.26192, lng: -123.25675},
      status: "working",
      reports: 0,
      lastChecked: "3 hours ago"
    }
  ]