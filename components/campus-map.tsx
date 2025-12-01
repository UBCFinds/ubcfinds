"use client"

// Import all libraries and components
import { useState, useEffect } from "react"
import { Search, Droplet, Bike, MapPin, AlertCircle, Coffee, Zap, Menu, X, ZoomIn, ZoomInIcon, MicrowaveIcon, ParkingCircle, BusFrontIcon, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UtilityDetail } from "@/components/utility-detail"
import { ReportModal } from "@/components/report-modal"
import { Data, GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { mockUtilities, Utility, UtilityType } from "@/components/utility-list"
import { createClient } from '@supabase/supabase-js';


// Setup supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);


// Categories for filtering utilities 
const categories = [
  { id: "water", label: "Water Stations", icon: Droplet, color: "text-[#3B82F6]"},
  { id: "microwave", label: "Microwaves", icon: MicrowaveIcon, color: "text-[#8B5CF6]"},
  { id: "bike", label: "Bike Storage", icon: Bike, color: "text-[#10B981]"},
  { id: "emergency", label: "Emergency", icon: AlertCircle, color: "text-[#EF4444]" },
  { id: "food", label: "Food & Drink", icon: Coffee, color: "text-[#F97316]"},
  { id: "charging", label: "Charging Stations", icon: Zap, color: "text-[#F59E0B]" },
  { id: "parking", label: "Parking Lots", icon: ParkingCircle, color: "text-[#f7fffd]"},
  { id: "bus", label: "Bus Stops and Stations", icon: BusFrontIcon, color: "text-[#06B6D4]"},
  { id: "bank", label: "ATMS and Banks", icon: DollarSign, color: "text-[#EC4899]"}
]

const colors = {
  blue: "#3b82f6", // working
  yellow: "#FFA500", // reported
  dark_brown: "#393424", // selected outline
  white: "#FFFFFF", // default outline

}

// Map container style and options
const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

// Center of UBC Campus
const ubcCenter = {
  lat: 49.2606,
  lng: -123.246,
}

// Map options including restrictions to UBC campus area
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  //49.282569, -123.275719
  //49.236203, -123.195687

  restriction: {
    latLngBounds: {
      north: 49.292569,
      south: 49.236203,
      east: -123.195687,
      west: -123.285719,
    },
    strictBounds: true,
  },
}

// Main CampusMap component 
// Renders the map, sidebar, and handles state management
export function CampusMap() {

  // Literally just an fsm 
  const [selectedCategories, setSelectedCategories] = useState<UtilityType[]>([
    "water",
    "bike",
    "washroom",
    "emergency",
    "food",
    "charging",
    "microwave",
    "bus",
    "bank",
    "parking"
  ])

  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [utilities, setUtilities] = useState<Utility[]>([])
  const [showLegend, setShowLegend] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Custom icon for user's location marker
  const getUserLocationIcon = () => {
    if (typeof window === "undefined" || !window.google || !window.google.maps) {
      return undefined
    }
    return {
      url: "/location_icon.png",
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    }
  }
  
  // Get user's location on component mount
  useEffect(() => {
    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }, [])


  useEffect(() => {
    console.log("Utilities updated with report counts");
    updateUtilitiesWithReports();
  }, [])

// Updates the utilitites with the number of reports from the database
const updateUtilitiesWithReports = async () => {
  try {
    // Fetch all reports
    const { data: reports, error } = await supabase
      .from("reports")
      .select("util_id");
    console.log("Fetched reports:", reports);
    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    // Count number of reports per utility
    const counts = reports?.reduce((acc, r) => {
      acc[r.util_id] = (acc[r.util_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Report counts:", counts, reports);

    // Update utilities state with report counts
    setUtilities(mockUtilities.map(u => ({
      ...u,
      reports: counts?.[u.id] || 0,
      status: counts?.[u.id] ? "reported" : "working" // update marker color

    })));
  } catch (err) {
    console.error("Unexpected error updating utilities:", err);
  }
};
  

  // Toggle category selection for filtering
  // If category is already selected, remove it; otherwise, add it
  // why am I even commenting this lmao (auto-suggested comment btw I had to include it)
  const toggleCategory = (categoryId: UtilityType) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Filter utilities based on selected categories and search query
  // Checks if the utility type is in selected categories and if the name or building includes the search query
  // Only checks the search if the search query is not empty
  const filteredUtilities = utilities.filter(
    (u) =>
      selectedCategories.includes(u.type) &&
      (searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.building.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  
  const getCategoryColor = (type: UtilityType) => {
    return categories.find((cat) => cat.id === type)?.color || "text-gray-400"
  }

  // Loads an instance of the map
  const onLoad = (mapInstance: google.maps.Map) => {
    console.log("Map loaded:", mapInstance)
    setMap(mapInstance)
    setMapLoaded(true)
  }


  const getMarkerIcon = (utility: Utility) => {
    if (typeof window === "undefined" || !window.google) {
      return undefined
    }

    // Get color based on utility status
    //const baseColor = utility.status === "reported" ? "#ef4444" : "#3b82f6"
    const baseColor = utility.status === "reported" ? colors.yellow : colors.blue

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: baseColor,
      fillOpacity: 1,
      //strokeColor: "#ffffff",
      strokeColor: selectedUtility?.id == utility.id ? colors.dark_brown : colors.white, // green outline when selected
      strokeWeight: 2,
      scale: selectedUtility?.id == utility.id ? 12 : 8,
    }
    
  }

  const updateUtil = async (utility: Utility) => {
    const { data, error } = await supabase
      .from("reports")
      .select("reports")
      .eq("id", utility.id)
      .single()
  
    if (error) {
      console.error("Error fetching utility:", error)
      return
    }
  
    return { ...utility, reports: data.reports }
  }
  


  // Handle what happens when a utility is selected
  const handleUtilitySelect = (utility: Utility) => {
    console.log("Handling utility selection for:", utility)
    console.log("Current map instance:", map)
    setSelectedUtility(utility)

    if (map){
      map.setZoom(15)
      const panPos = new google.maps.LatLng(utility.position.lat, utility.position.lng+0.003)
      map.panTo(panPos)
    }
    
  }

  return (
    <div className="relative h-full w-full bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
             {/* Old toggle button - hidden cuz its duplicated */}
            {/* <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button> */}
            <div>
              <h1 className="text-xl font-bold text-balance">UBC Finds</h1>
              <p className="text-xs text-muted-foreground">So you dont get left behind</p>
            </div>
          </div>
          <Button
            onClick={() => setShowReportModal(true)}
            size="icon"
            className="bg-[#FFA500] hover:bg-[#e59400] text-white rounded-full w-8 h-8 flex items-center justify-center"
            title="Report Issue"
          >
            <span className="text-lg font-bold">!</span>
          </Button>

        </div>
      </header>


      {/* Toggle Sidebar Button - always visible */}
      <Button
        variant="default"
        size="icon"
        className={`absolute top-20 z-50 ${sidebarOpen ? "left-[330px]" : "left-[10px]"} text-white-700 hover:text-gray-900 bg-black/70 hover:bg-white/90 border-gray-300 `}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>



      {/* Sidebar */}
      <aside
        className={cn(
          "absolute top-16 left-0 bottom-0 z-20 w-80 bg-card border-r border-border transition-transform duration-300 overflow-y-auto",
          !sidebarOpen && "-translate-x-full",
        )}
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search utilities or buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Filter by Category</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategories.includes(category.id as UtilityType)
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id as UtilityType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isSelected && category.color)} />
                    <span className="text-sm font-medium">{category.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {mockUtilities.filter((u) => u.type === category.id).length}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Utility List */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Nearby Utilities ({filteredUtilities.length})</h3>
            <div className="space-y-2">
              {filteredUtilities.map((utility) => (
                <button
                  key={utility.id}                  
                  onClick={() => handleUtilitySelect(utility)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedUtility?.id === utility.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{utility.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {utility.building} • {utility.floor}
                      </p>
                    </div>
                    {utility.status === "reported" && (
                      <Badge variant="destructive" className="text-xs">
                        {utility.reports} reports
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <footer className="text-center text-xs text-gray-500 py-4 border-t">
          © {new Date().getFullYear()} UBC Finder. All rights reserved.  
          This project is student-developed and not officially affiliated with the University of British Columbia.
        </footer>
        </div>
      </aside>

      
      {/* Map */}
      <div
        className={cn(
          "absolute top-16 bottom-0 right-0 transition-all duration-300",
          sidebarOpen ? "left-80" : "left-0",
        )}
      >
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || ubcCenter} // Center on user location if available
        zoom={userLocation ? 16 : 15} // Zoom in closer if user location is available
        options={mapOptions}
        onLoad={onLoad}

      >
        {/*User's current location marker*/}
        {userLocation && mapLoaded &&(
          <Marker
            position={userLocation}
            icon={getUserLocationIcon()}
            title="You are here"
          />
        )}

        {/* Utility Markers */}
        {filteredUtilities.map((utility) => (
          <Marker
            key={utility.id}
            position={utility.position}
            onClick={() => {
              handleUtilitySelect(utility)
              //setSelectedUtility(utility)
            }}
            icon={getMarkerIcon(utility)}
            
            // Describe the util on hover
            title={utility.reports ? utility.reports >=2 ? `${utility.name} - ${utility.reports} reports` :`${utility.name} - ${utility.reports} report` : utility.name}
            />
        ))}



      </GoogleMap>
    </LoadScript>

      {/* Legend */}
      {showLegend && (
      <Card className="absolute bottom-4 left-4 w-50">
        <CardHeader className="pb-0 flex justify-between items-center">
          <CardTitle className="text-sm">Map Legend</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowLegend(false)}>
              <X className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Working</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FFA500" }} />
            <span>Reported Issue</span>
          </div>
        </CardContent>
      </Card>
    )}



      </div>

      {/* Utility Detail Panel */}
      {selectedUtility && (
        <UtilityDetail
          utility={selectedUtility}
          onClose={() => {
            setSelectedUtility(null)
          }}
          onReport={() => {
            setShowReportModal(true)
          }}
          onGetDirections={() => {}}
        />
      )}

      {/* Report Modal */}
      {showReportModal && <ReportModal utility={selectedUtility} onClose={() => setShowReportModal(false)} />}
    </div>
  )
}
