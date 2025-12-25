"use client"

import React from "react"
import { MapPin, Clock, AlertTriangle, X, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Utility {
  id: string
  name: string
  type: string
  building: string
  floor: string
  position: { lat: number; lng: number }
  status: "working" | "reported" | "maintenance"
  reports: number
  lastChecked: string
}

interface UtilityDetailProps {
  utility: Utility
  onClose: () => void
  onReport: () => void
  isMobile: boolean
}

export function UtilityDetail({ utility, onClose, onReport, isMobile }: UtilityDetailProps) {
  
  const onGetDirections = () => {
    const destination = `${utility.position.lat},${utility.position.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
    window.open(url, "_blank");
  }

  return (
    <Card 
      className={cn(
        "z-30 shadow-xl transition-all duration-300 animate-in",
        // DESKTOP: Original Top-Right Position
        !isMobile && "absolute top-20 right-4 w-80 slide-in-from-right",
        // MOBILE: Bottom Sheet Position
        isMobile && "fixed bottom-0 left-0 right-0 w-full rounded-t-[2rem] rounded-b-none border-t border-border bg-card slide-in-from-bottom"
      )}
    >
      <CardHeader className={cn("pb-3", isMobile ? "pt-2" : "pt-6")}>
        {/* Only show drag handle on mobile */}
        {isMobile && <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 mt-1" />}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-balance leading-tight">{utility.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {utility.building} • {utility.floor}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", isMobile ? "pb-10" : "pb-6")}>
        <div className="flex items-center gap-2">
          {utility.status === "working" && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Working
            </Badge>
          )}
          {utility.status === "reported" && (
            <Badge className="bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/40">
              {utility.reports} Issue{utility.reports > 1 ? "s" : ""} Reported
            </Badge>
          )}
          {utility.status === "maintenance" && (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
              Maintenance
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last checked: {utility.lastChecked}</span>
        </div>

        {utility.status === "reported" && (
          <div className="p-3 rounded-lg border bg-[#FFA500]/10 border-[#FFA500]/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-[#FFA500]" />
              <p className="text-xs text-[#FFA500] font-medium">
                Recent reports indicate this utility may not be working properly.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Quick Actions</h4>
          <div className="flex gap-2">
            <Button 
              variant={isMobile ? "default" : "outline"} 
              size="sm" 
              className="flex-1" 
              onClick={onGetDirections}
            >
              {isMobile && <Navigation className="mr-2 h-4 w-4" />}
              Navigate
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onReport}>
              Report Issue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}