"use client"

import { useState, useEffect, type ReactElement } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Menu, AlertCircle, MapPin } from "lucide-react"

interface MobileOnboardingModalProps {
  open: boolean
  onClose: () => void
}

const steps = [
  {
    title: "Welcome to UBC Finds! 👋",
    description: "Quickly locate water fountains, washrooms, microwaves, and other utilities across UBC campus.",
    icon: MapPin,
  },
  {
    title: "Browse Campus Utilities",
    description: "Tap the 'Utility List' button at the bottom to explore all available resources. Select categories to filter what appears on the map.",
    icon: Menu,
  },
  {
    title: "Report Issues",
    description: "Found something broken? Tap the orange ! button in the top-right to report it and help other students.",
    icon: AlertCircle,
  }
]

export function MobileOnboardingModal({ open, onClose }: MobileOnboardingModalProps): ReactElement {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {currentStep.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStep.description}
          </p>
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === step ? "bg-primary w-6" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack} size="sm">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="ml-auto" size="sm">
              {step < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
