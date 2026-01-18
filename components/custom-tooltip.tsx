import { TooltipRenderProps } from "react-joyride"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Custom tooltip renderer for the Joyride tour component.
 *
 * This component provides a styled tooltip using shadcn/ui components that
 * matches the application's design system. It displays tour step content with
 * navigation buttons (Back, Next/Finish, End) and a progress indicator.
 *
 * @param index - Current step index (0-based)
 * @param step - Current step configuration object
 * @param backProps - Props to spread on the Back button
 * @param primaryProps - Props to spread on the Next/Finish button
 * @param tooltipProps - Props to spread on the tooltip container
 * @param isLastStep - Whether this is the last step in the tour
 * @param size - Total number of steps in the tour
 * @param skipProps - Props to spread on the Skip/End button
 * @returns A styled Card component containing the tour tooltip
 */
export function CustomTooltip({
  index,
  step,
  backProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
  skipProps,
}: TooltipRenderProps) {
  return (
    <Card className="max-w-[350px] shadow-xl border-primary/20" {...tooltipProps}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{step.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{step.content as string}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="flex justify-between w-full gap-4">
          <div className="flex gap-2">
            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                {...skipProps}
                aria-label="End tour"
                className="text-muted-foreground px-2 h-8"
              >
                End
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                variant="outline"
                size="sm"
                {...backProps}
                aria-label="Previous step"
                className="h-8"
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              {...primaryProps}
              aria-label={isLastStep ? "Finish tour" : "Next step"}
              className="h-8"
            >
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right w-full">
          {index + 1} of {size}
        </div>
      </CardFooter>
    </Card>
  )
}
