"use client"

// Import all libraries and components
import { useState, useEffect } from "react"
import { Menu, X, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UtilityDetail } from "@/components/utility-detail"
import { ReportModal } from "@/components/report-modal"
import { DesktopOnboardingModal } from "@/components/desktop-onboarding-modal"
import { MobileOnboardingModal } from "@/components/mobile-onboarding-modal"
import { Data, GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { mockUtilities, Utility, UtilityType } from "@/components/utility-list"
import { supabase } from "@/lib/supabase";
import { categories, colors, toggleCategory as toggleCategoryLogic, getCategoryColor as getCategoryColorLogic, filterUtilities, getMarkerIcon as getMarkerIconLogic } from "@/lib/map-logic"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { UtilitySidebarContent } from "@/components/utility-sidebar-content"

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

const UBC_BOUNDS = {
  north: 49.292569,
  south: 49.236203,
  east: -123.195687,
  west: -123.285719,
};

// Map options including restrictions to UBC campus area
const mapOptions = {
  gestureHandling: 'greedy',
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

const isPointInUBC = (lat: number, lng: number) => {
  return (
    lat <= UBC_BOUNDS.north &&
    lat >= UBC_BOUNDS.south &&
    lng <= UBC_BOUNDS.east &&
    lng >= UBC_BOUNDS.west
  );
};

// Main CampusMap component 
// Renders the map, sidebar, and handles state management
export function CampusMap() {

  // Literally just an fsm 
  const [selectedCategories, setSelectedCategories] = useState<UtilityType[]>([
  ])

  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null)
  const [reportingUtility, setReportingUtility] = useState<Utility | null>(null);
  const [searchQuery, setSearchQuery] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [utilities, setUtilities] = useState<Utility[]>(mockUtilities)
  const [showLegend, setShowLegend] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [snap, setSnap] = useState<number | string | null>(0.4)

  /**
   * Generates the icon for the user's current location.
   * 
   * @requires window.google must be loaded.
   * @effects Returns a google.maps.Icon object configured with the custom 
   *          "/location_icon.png", scaled to 32x32px.
   */

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

  /**
   * Updates the utilities state with report counts from the database.
   * 
   * @requires Supabase client must be initialized.
   * @modifies utilities state.
   * @effects Asynchronously fetches all reports from the database. 
   *          Aggregates report counts by util_id. 
   *          Updates the local utilities state, setting the reports count 
   *          and changing status to "reported" if reports > 0.
   */
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
      status: counts?.[u.id] >= 3 ? "reported" : "working" // update marker color

    })));
  } catch (err) {
    console.error("Unexpected error updating utilities:", err);
  }
};
  

  /**
   * Toggles the selection of a utility category.
   * 
   * @param categoryId - The ID of the category to toggle.
   * @requires categoryId must be a valid UtilityType.
   * @modifies selectedCategories state.
   * @effects Toggles the presence of categoryId in the selectedCategories array. 
   *          If present, it is removed; if absent, it is added.
   */
  const toggleCategory = (categoryId: UtilityType) => {
    setSelectedCategories((prev) => toggleCategoryLogic(prev, categoryId))
  }

  // Filter utilities based on selected categories and search query
  // Checks if the utility type is in selected categories and if the name or building includes the search query
  // Only checks the search if the search query is not empty
  const filteredUtilities = filterUtilities(utilities, selectedCategories, searchQuery);
  
  
  /**
   * Retrieves the color associated with a utility category.
   * 
   * @param type - The utility type to get the color for.
   * @requires type is a valid UtilityType.
   * @effects Returns the specific Tailwind CSS color class string associated with the given utility type. 
   *          Returns a default gray color if the type is not found.
   */
  const getCategoryColor = (type: UtilityType) => {
    return getCategoryColorLogic(type)
  }

  // Loads an instance of the map
  const onLoad = (mapInstance: google.maps.Map) => {
    console.log("Map loaded:", mapInstance)
    setMap(mapInstance)
    setMapLoaded(true)
  }


  /**
   * Generates the marker icon configuration for a utility.
   * 
   * @param utility - The utility object to generate the icon for.
   * @requires utility is a valid object. window.google and window.google.maps must be loaded.
   * @effects Returns a google.maps.Symbol object defining the marker's visual appearance.
   *          - Color: Yellow if status is 'reported', Blue otherwise.
   *          - Stroke: Dark brown if selected, White otherwise.
   *          - Scale: 12 if selected, 8 otherwise.
   */
  const getMarkerIcon = (utility: Utility) => {
    if (typeof window === "undefined" || !window.google || !window.google.maps) {
      return undefined
    }

    return getMarkerIconLogic(utility, selectedUtility?.id, window.google.maps)
  }

  /**
   * Fetches the latest data for a specific utility from the database.
   * 
   * @param utility - The utility to update.
   * @requires utility has a valid id. Supabase client is initialized.
   * @effects Asynchronously fetches the latest report count for the specific utility from the database. 
   *          Returns a new Utility object with the updated report count. 
   *          Returns undefined if the fetch fails.
   */
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
  

  /**
   * Handles the selection of a utility marker.
   * 
   * @param utility - The selected utility.
   * @requires utility is a valid object with a position.
   * @modifies selectedUtility state, Map view (zoom and center).
   * @effects Sets the selectedUtility state. 
   *          If the map instance is ready, zooms to level 15 and pans the map 
   *          to the utility's location (with a +0.003 latitude offset).
   */
  const handleUtilitySelect = (utility: Utility) => {
    setSelectedUtility(utility)
  
    if (map) {
      const zoom = map.getZoom() ?? 15;
      const currentZoom = zoom < 16 ? 16 : zoom; // Zoom in slightly more for detail
      map.setZoom(currentZoom);
  
      if (isMobile) {
        // Lattitude Offset: -0.006 pushes the "center" way down, 
        // effectively moving the marker to the top of the phone screen.
        const latOffset = -0.0035 * Math.pow(2, 15 - currentZoom);
        map.panTo({ 
          lat: utility.position.lat + latOffset, 
          lng: utility.position.lng 
        });
      } else {
        const lngOffset = 0.003 * Math.pow(2, 15 - currentZoom);
        map.panTo({ 
          lat: utility.position.lat, 
          lng: utility.position.lng + lngOffset 
        });
      }
    }
  }

  // Update your report trigger function
  const handleOpenReport = (utility: Utility | null) => {
    setReportingUtility(utility); // Lock in the specific utility
    setShowReportModal(true);
    
    // Optimization for mobile: Close the info drawer so it doesn't block the screen
    if (isMobile) {
      setSelectedUtility(null); 
    }
  };

  // Update the center logic in the GoogleMap component
  const getInitialCenter = () => {
    if (userLocation && isPointInUBC(userLocation.lat, userLocation.lng)) {
      return userLocation;
    }
    return ubcCenter;
  };

  // Helper to wrap the props we need to pass down
  const sidebarProps = {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    filteredUtilities,
    selectedUtilityId: selectedUtility?.id,
    handleUtilitySelect,
    utilities,
  }

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">UBC Finds</h1>
            <p className="text-xs text-muted-foreground">So you don't get left behind.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={() => setShowOnboarding(true)}
              aria-label="Start tutorial"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button
              id="tour-report-btn"
              onClick={() => setShowReportModal(true)}
              size="icon"
              className="bg-[#FFA500] hover:bg-[#e59400] text-white rounded-full w-8 h-8"
            >
              <span className="text-lg font-bold">!</span>
            </Button>
          </div>
        </div>
      </header>
  
      <div className="relative flex-1">
        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <>
            <Button
              variant="default"
              size="icon"
              className={`absolute top-20 z-50 ${sidebarOpen ? "left-[330px]" : "left-[10px]"} bg-black/70 transition-all`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
  
            <aside className={cn(
              "absolute top-16 left-0 bottom-0 z-20 w-80 bg-background border-r transition-transform overflow-y-auto",
              !sidebarOpen && "-translate-x-full"
            )}>
              <UtilitySidebarContent {...sidebarProps} />
            </aside>
          </>
        )}
  
        {/* MOBILE DRAWER */}
        {isMobile && !selectedUtility && (
          <Drawer 
            open={mobileDrawerOpen} 
            onOpenChange={setMobileDrawerOpen}
            snapPoints={[0.4, 0.85]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
          >
            <DrawerTrigger asChild>
            <Button id="tour-mobile-drawer-trigger" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full shadow-xl px-10 py-6 text-lg font-bold bg-slate-900 text-slate-50 hover:bg-slate-800 active:scale-95 transition-all">
              <Menu className="mr-2 h-5 w-5" /> Utility List
            </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left px-4">
                <DrawerTitle>Campus Utilities</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto pb-20">
                <UtilitySidebarContent {...sidebarProps} />
              </div>
            </DrawerContent>
          </Drawer>
        )}
  
        {/* MAP CONTAINER */}
        <div className={cn(
          "absolute inset-0 top-16 transition-all duration-300",
          (!isMobile && sidebarOpen) ? "left-80" : "left-0"
        )}>
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={getInitialCenter()} // Use the checked location
            zoom={userLocation && isPointInUBC(userLocation.lat, userLocation.lng) ? 16 : 15}
            options={mapOptions}
            onLoad={onLoad}
          >
              {/* Only show the blue dot if they are on campus to avoid confusion */}
              {userLocation && mapLoaded && isPointInUBC(userLocation.lat, userLocation.lng) && (
                  <Marker position={userLocation} icon={getUserLocationIcon()} />
              )}

              {filteredUtilities.map((utility) => (
                <Marker
                  key={utility.id}
                  position={utility.position}
                  onClick={() => handleUtilitySelect(utility)}
                  icon={getMarkerIcon(utility)}
                  title={utility.name}
                />
              ))}
            </GoogleMap>
          </LoadScript>
  
          {/* Legend */}
          {showLegend && !isMobile && ( // Removed on mobile
            <Card className="absolute bottom-9 left-4 w-50">
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
      </div>
  
    {/* Utility Detail Panel */}
    {selectedUtility && (
      <UtilityDetail
        utility={selectedUtility}
        isMobile={isMobile} // Pass the responsive flag
        onClose={() => setSelectedUtility(null)}
        onReport={() => handleOpenReport(selectedUtility)}
        // onGetDirections is removed because the component handles it internally now
      />
    )}
    {/* Onboarding Modals */}
    {isMobile ? (
      <MobileOnboardingModal 
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    ) : (
      <DesktopOnboardingModal 
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    )}
    
    {/* Report Modal */}
    {showReportModal && (
      <ReportModal 
        utility={reportingUtility} // Use reportingUtility instead of selectedUtility
        onClose={() => {
          setShowReportModal(false);
          setReportingUtility(null); // Clear it only when the modal is actually closed
        }} 
      />
    )}

    </div>
  )
}
