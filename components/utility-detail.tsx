"use client"

import React from "react"
import { MapPin, Clock, AlertTriangle, X, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

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

  // Common UI elements shared between Desktop Card and Mobile Drawer
  const StatusSection = (
    <div className="flex items-center gap-2">
      {utility.status === "working" && (
        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
          Working
        </Badge>
      )}
      {utility.status === "reported" && (
        <Badge className="bg-[#FFA500]/10 text-[#FFA500] border border-[#FFA500]/40">
          {utility.reports} Issue{utility.reports > 1 ? "s" : ""} Reported
        </Badge>
      )}
      {utility.status === "maintenance" && (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          Maintenance
        </Badge>
      )}
    </div>
  )

  const ActionButtons = (
    <div className="flex gap-2 w-full pt-2">
      <Button 
        variant={isMobile ? "default" : "outline"} 
        className="flex-1 h-12 lg:h-9 font-bold" 
        onClick={onGetDirections}
      >
        <Navigation className="mr-2 h-4 w-4" />
        Navigate
      </Button>
      <Button variant="outline" className="flex-1 h-12 lg:h-9" onClick={onReport}>
        Report Issue
      </Button>
    </div>
  )

  // --- MOBILE DRAWER VERSION ---
  if (isMobile) {
    return (
      <Drawer
        open={!!utility}
        onOpenChange={(open) => !open && onClose()}
        modal={false}
        dismissible={true}
        >
        <DrawerContent className="max-h-[45vh] bg-card/95 backdrop-blur-md border-t border-border">
          <div className="mx-auto w-12 h-1.5 bg-muted rounded-full my-4" />
          <DrawerHeader className="text-left px-6">
            <div className="flex justify-between items-start">
              <div>
                <DrawerTitle className="text-xl font-bold">{utility.name}</DrawerTitle>
                <DrawerDescription className="flex items-center gap-1 mt-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {utility.building} • {utility.floor}
                </DrawerDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted/50">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="px-6 space-y-6 pb-10">
            <div className="flex items-center justify-between">
              {StatusSection}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Checked: {utility.lastChecked}</span>
              </div>
            </div>

            {utility.status === "reported" && (
              <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-600 leading-snug">
                  Recent reports indicate this utility might be out of service.
                </p>
              </div>
            )}

            {ActionButtons}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // --- DESKTOP CARD VERSION (Original UI) ---
  return (
    <Card className="absolute top-20 right-4 w-80 shadow-xl z-30 animate-in slide-in-from-right duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{utility.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 text-xs">
              <MapPin className="h-3 w-3" />
              {utility.building} • {utility.floor}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {StatusSection}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last checked: {utility.lastChecked}</span>
        </div>
        {utility.status === "reported" && (
          <div className="p-3 rounded-lg border bg-[#FFA500]/10 border-[#FFA500]/20 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-[#FFA500] shrink-0" />
            <p className="text-xs text-[#FFA500] font-medium">Recent issues reported.</p>
          </div>
        )}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Quick Actions</h4>
          {ActionButtons}
        </div>
      </CardContent>
    </Card>
  )
}