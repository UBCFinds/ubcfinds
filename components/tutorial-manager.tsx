"use client"

import { useState, useEffect } from "react"
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps } from "react-joyride"
import { useIsMobile } from "@/hooks/use-mobile"
import { CustomTooltip } from "@/components/custom-tooltip"

interface TutorialManagerProps {
  run: boolean
  onFinish: () => void
  setOpenMobileDrawer?: (open: boolean) => void
}

export function TutorialManager({ run, onFinish, setOpenMobileDrawer }: TutorialManagerProps) {
  const isMobile = useIsMobile()
  const [steps, setSteps] = useState<Step[]>([])
  const [mounted, setMounted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Reset step index when tour is started
  useEffect(() => {
    if (run) {
      setStepIndex(0)
    }
  }, [run])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Define steps based on device type
    const tourSteps: Step[] = [
      {
        target: "body",
        title: "Welcome to UBC Finds! 👋",
        content: "Let's take a quick tour to help you find what you need on campus.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: isMobile ? "#tour-mobile-drawer-trigger" : "#tour-search", // Mobile needs to target the button to open drawer
        title: "Search & Filter",
        content: isMobile 
          ? "Tap 'Next' to open the utility list where you can search and filter."
          : "Type here to search for specific buildings or locations.",
        placement: isMobile ? "top" : "right",
      },
      {
        target: "#tour-categories",
        title: "Categories",
        content: "Tap these buttons to show or hide microwaves, water fountains, and more on the map.",
        placement: isMobile ? "top" : "right",
      },
      {
        target: "#tour-report-btn",
        title: "Report Issues",
        content: "Found a broken utility? Click this button to let us and other students know!",
        placement: "bottom",
      },
      {
        target: "body", // End at center again
        title: "You're all set! 🚀",
        content: "Go explore the campus. If you need this tour again, click the help icon.",
        placement: "center",
      }
    ]

    setSteps(tourSteps)
  }, [isMobile])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      onFinish()
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Controlled Logic: Only advance index explicitly on Next/Prev actions
      // This ignores clicks on the target itself
      
      // If we are on step 2 (index 1) and moving to step 3 on mobile, open the drawer
      if (index === 1 && action === ACTIONS.NEXT && isMobile && setOpenMobileDrawer) {
        setOpenMobileDrawer(true)
      }

      const nextStep = index + (action === ACTIONS.PREV ? -1 : 1)

      if (action === ACTIONS.NEXT || action === ACTIONS.PREV) {
        setStepIndex(nextStep)
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      spotlightClicks={true}
      disableOverlayClose={true}
      tooltipComponent={CustomTooltip}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          zIndex: 10000,
        }
      }}
      callback={handleJoyrideCallback}
      scrollOffset={100}
    />
  )
}
