import { TooltipRenderProps } from "react-joyride"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
      <CardFooter className="flex justify-between gap-4 pt-0">
        <div className="flex gap-2">
          {!isLastStep && (
             <Button variant="ghost" size="sm" {...skipProps} className="text-muted-foreground px-2 h-8">
               End
             </Button>
          )}
        </div>
        <div className="flex gap-2">
          {index > 0 && (
            <Button variant="outline" size="sm" {...backProps} className="h-8">
              Back
            </Button>
          )}
          <Button size="sm" {...primaryProps} className="h-8">
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>
      </CardFooter>
      <div className="px-6 pb-4 text-xs text-muted-foreground">
         {index + 1} of {size}
      </div>
    </Card>
  )
}
