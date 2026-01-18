"use client"

import { useState, useEffect, useMemo } from "react"
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from "react-joyride"
import { useIsMobile } from "@/hooks/use-mobile"
import { CustomTooltip } from "@/components/custom-tooltip"

interface TutorialManagerProps {
  run: boolean
  onFinish: () => void
  setOpenMobileDrawer?: (open: boolean) => void
}

/**
 * Manages the application's onboarding/tutorial tour using `react-joyride`.
 *
 * This component:
 * - Builds a sequence of Joyride steps that differ between mobile and desktop,
 *   based on the current device type.
 * - Controls the current step index explicitly via state and the Joyride callback,
 *   advancing only on Next/Prev actions and resetting to the first step whenever
 *   a new run is started.
 * - Invokes the `onFinish` callback when the tour is completed or skipped, so
 *   callers can persist that the tutorial has been seen or update local state.
 * - Integrates with an optional mobile drawer by calling `setOpenMobileDrawer(true)`
 *   when advancing from the second to the third step (index 1 → 2) on mobile,
 *   ensuring that drawer-based content is visible for the subsequent tour step.
 *
 * @param run Whether the tutorial should be running. When set to `true`, the tour
 *   resets its internal step index and starts from the first step.
 * @param onFinish Callback invoked when the tour finishes or is skipped.
 * @param setOpenMobileDrawer Optional callback used on mobile to open a navigation
 *   or content drawer at a specific point in the tour.
 * @returns The configured Joyride instance that renders the tutorial, or `null`
 *   until the component has mounted.
 */
export function TutorialManager({ run, onFinish, setOpenMobileDrawer }: TutorialManagerProps) {
  const isMobile = useIsMobile()
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

  // Memoize steps to prevent recreation on every render
  const steps = useMemo(() => {
    const tourSteps: Step[] = [
      {
        target: "body",
        title: "Welcome to UBC Finds! 👋",
        content: "Let's take a quick tour to help you find what you need on campus.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: isMobile ? "#tour-mobile-drawer-trigger" : "#tour-search",
        title: "Search & Filter",
        content: isMobile 
          ? "Tap 'Next' to open the utility list where you can search and filter."
          : "Type here to search for specific buildings or locations.",
        placement: isMobile ? "top" : "right",
      },
      {
        target: "#tour-categories",
        title: "Categories",
        content: isMobile
          ? "Tap these buttons to show or hide microwaves, water fountains, and more on the map."
          : "Click these buttons to show or hide microwaves, water fountains, and more on the map.",
        placement: isMobile ? "top" : "right",
      },
      {
        target: "#tour-report-btn",
        title: "Report Issues",
        content: isMobile
          ? "Found a broken utility? Tap this button to let us and other students know!"
          : "Found a broken utility? Click this button to let us and other students know!",
        placement: "bottom",
      },
      {
        target: "body",
        title: "You're all set! 🚀",
        content: isMobile
          ? "Go explore the campus. If you need this tour again, tap the help icon."
          : "Go explore the campus. If you need this tour again, click the help icon.",
        placement: "center",
      }
    ]

    return tourSteps
  }, [isMobile])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish()
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Controlled Logic: Only advance index explicitly on Next/Prev actions
      // This ignores clicks on the target itself
      
      // If we are on step 2 (index 1) and moving to step 3 on mobile, open the drawer
      if (index === 1 && action === ACTIONS.NEXT && isMobile && setOpenMobileDrawer) {
        setOpenMobileDrawer(true)
        // Wait for the drawer animation to complete before advancing to the next step
        // This ensures the target element (#tour-categories) is visible in the DOM
        // Typical drawer animations take 200-300ms, so we wait 300ms to be safe
        setTimeout(() => {
          const nextStep = index + 1
          setStepIndex(nextStep)
        }, 300)
        return
      }
      
      // If we are on step 3 (index 2) and going back to step 2 on mobile, close the drawer
      if (index === 2 && action === ACTIONS.PREV && isMobile && setOpenMobileDrawer) {
        setOpenMobileDrawer(false)
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
