"use client"

import { useState, useEffect, type ReactElement } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, Filter, AlertCircle, MapPin, CheckCircle } from "lucide-react"

interface DesktopOnboardingModalProps {
  open: boolean
  onClose: () => void
}

const steps = [
  {
    title: "Welcome to UBC Finds",
    description: "Your comprehensive guide to finding utilities and amenities across UBC campus.",
    icon: MapPin,
    details: [
      "Locate water fountains, washrooms, microwaves, and more",
      "Real-time information on utility availability",
      "Help fellow students by reporting issues"
    ]
  },
  {
    title: "Search & Browse Utilities",
    description: "The sidebar on the left is your control center for finding what you need.",
    icon: Search,
    details: [
      "Use the search bar to find specific buildings or locations",
      "Browse all available utilities in the scrollable list",
      "Click on any utility to see it on the map"
    ]
  },
  {
    title: "Filter by Category",
    description: "Show only the utilities you're looking for by selecting categories.",
    icon: Filter,
    details: [
      "Click category buttons to toggle them on/off",
      "Multiple categories can be selected at once",
      "Map updates instantly to show only selected types"
    ]
  },
  {
    title: "Report Issues",
    description: "Found something broken? Help the community by reporting it.",
    icon: AlertCircle,
    details: [
      "Click the orange ! button in the top-right area of the header",
      "Select the utility and describe the issue",
      "Other students will see your report"
    ]
  },
  {
    title: "You're All Set!",
    description: "Start exploring campus utilities and finding what you need.",
    icon: CheckCircle,
    details: [
      "Click the ? icon anytime to see this guide again",
      "Markers on the map show utility locations",
      "Yellow markers indicate reported issues"
    ]
  }
]

export function DesktopOnboardingModal({ open, onClose }: DesktopOnboardingModalProps): ReactElement {
  const [step, setStep] = useState(0)
  const currentStep = steps[step]
  const Icon = currentStep.icon

  // Reset to first step whenever modal opens
  useEffect(() => {
    if (open) {
      setStep(0)
    }
  }, [open])

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {currentStep.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <ul className="space-y-3">
            {currentStep.details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? "bg-primary w-8" : "bg-muted w-2"
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between gap-3">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 0}
            className="w-24"
          >
            Back
          </Button>
          <Button onClick={handleNext} className="w-24">
            {step < steps.length - 1 ? "Next" : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
