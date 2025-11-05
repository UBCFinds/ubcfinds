UBC Finder – Software Architecture

Overview
UBC Finds is a web application that helps users locate and report campus utilities such as water fountains, washrooms, bike storage, and charging stations. The system follows a Client-Server architecture and adopts the Model-View-Controller (MVC) pattern.
Client: Handles user interaction, map display, and submitting reports.
Server: Hosts the database (Supabase) and provides API endpoints for storing and retrieving reports.
Model: Represents utilities and reports.
View: React components that render maps, lists, modals, and detail panels.
Controller: Handles business logic such as filtering, selecting utilities, and submitting reports.
Components
1. Models
Utility
Responsibility: Represents a campus utility and its status.
Location: Client (in-memory) and server (Supabase database for reports).
Communicates with:
CampusMap (View/Controller) to display utilities.
Supabase API to retrieve report counts and status updates.

Report
Responsibility: Stores user-submitted reports about utilities.
Location: Server (Supabase database).
Communicates with:
ReportModal (Controller) to insert new reports.
CampusMap (Controller) to update utility status counts.



2. Views
CampusMap
Responsibility: Main map view displaying utilities, filtering options, sidebar, and legend.
Location: Client.
Communicates with:
UtilityDetail to display detailed information.
ReportModal to report issues.
Supabase via updateUtilitiesWithReports() to fetch report counts.


UtilityDetail
Responsibility: Displays detailed info about a selected utility, including status, recent reports, and quick actions (get directions, report issue).
Location: Client.
Communicates with:
CampusMap to receive selected utility.
Browser (via window.open) for directions.

ReportModal
Responsibility: Collects user input to submit a new report.
Location: Client.
Communicates with:
Supabase API to insert reports.
CampusMap to trigger updates after submission.


Sidebar & Filters (Part of CampusMap)
Responsibility: Allows filtering utilities by category and search query.
Location: Client.
Communicates with:
CampusMap to update selectedCategories and searchQuery.



3. Controllers / Business Logic
CampusMap Controller Logic
Responsibility:
Handle filtering by category and search query.
Handle utility selection and panning/zooming the map.
Update utility markers with report counts from Supabase.


Location: Client.
Communicates with:
Utility model for status and reports.
Supabase API to fetch report counts.
UtilityDetail view for selected utility display.


ReportModal Controller Logic
Responsibility:
Validate and submit the report form.
Update utility status based on the number of reports.


Location: Client.
Communicates with:
Supabase API for storing reports.
CampusMap to trigger UI updates.



4. Data Store / Server
Supabase
Responsibility: Stores reports with util_id, issue_type, description, and timestamp.
Location: Server.
Communicates with:
ReportModal to insert new reports.
CampusMap to fetch current report counts.



5. Utilities
UtilityList / mockUtilities
Responsibility: Provides sample utility data for development and initial map display.
Location: Client.
Communicates with:
CampusMap for displaying markers and lists.
ReportModal is accessed indirectly via report submission.



Stubs:

Utility-details.tsx
```
"use client"

import { MapPin, Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Types
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
  onGetDirections: () => void
}

// Stub functions
const onGetDirectionsStub = (utility: Utility) => {
  console.log(`[Stub] Get directions to: ${utility.name} at ${utility.building}, ${utility.floor}`)
}

export function UtilityDetail({ utility, onClose, onReport }: UtilityDetailProps) {
  return (
	{/*html contents*/}
  )
}

```


campus-map.tsx
```
// campus-map.tsx
import React, { useState, useEffect } from "react";
import { Utility, UtilityType, mockUtilities } from "./utility-list";
import { UtilityDetail } from "./utility-detail";
import { ReportModal } from "./report-modal";

export function CampusMap() {
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [utilities, setUtilities] = useState<Utility[]>(mockUtilities);

  const handleUtilitySelect = (utility: Utility) => setSelectedUtility(utility);

  return (
    <div>
      <div>CampusMap Component Placeholder</div>
      {utilities.map((u) => (
        <button key={u.id} onClick={() => handleUtilitySelect(u)}>
          {u.name}
        </button>
      ))}
      {selectedUtility && <UtilityDetail utility={selectedUtility} onClose={() => setSelectedUtility(null)} onReport={() => {}} onGetDirections={() => {}} />}
      {showReportModal && <ReportModal utility={selectedUtility} onClose={() => setShowReportModal(false)} />}
    </div>
  );
}
```


report-modal.tsx
```
"use client"

import type React from "react"
import { useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Stub Supabase client
export const supabase = {
  from: (_table: string) => ({
    insert: async (_data: any[]) => ({ data: [], error: null }),
  }),
}

// Types
interface Utility {
  name: string
  building: string
  id: string
}

interface ReportModalProps {
  utility: Utility | null
  onClose: () => void
}

// Stub functions
const handleSubmitStub = async (e: React.FormEvent, utility: Utility | null, issueType: string, description: string, setSubmitted: (v: boolean) => void) => {
  e.preventDefault()
  console.log("Stub: handleSubmit called", { utility, issueType, description })
  setSubmitted(true)
}

export function ReportModal({ utility, onClose }: ReportModalProps) {
  const [issueType, setIssueType] = useState("not-working")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  return (
{/*Html contents*/}
    )
}
```



Theme-provider.tsx
```
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```


utility-list.ts
```
// Defines what types of utilities are available and their structure
export type UtilityType = "water" | "bike" | "washroom" | "emergency" | "food" | "charging"

//pushing random
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
//returns all utility details
       },
  ]
```
