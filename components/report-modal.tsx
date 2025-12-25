"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { supabase } from "@/lib/supabase";
import { id } from "date-fns/locale"
import { set } from "date-fns"

interface ReportModalProps {
  utility: { name: string; building: string; id: string } | null
  onClose: () => void
}

export function ReportModal({ utility, onClose }: ReportModalProps) {
  const [issueType, setIssueType] = useState("not-working")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [showReportModal, setShowReportModal] = useState(true); // Added state to control modal visibility
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles the submission of a utility report.
   * 
   * @param e - The form submission event.
   * @requires e is a valid form event. utility prop is defined (or handles null).
   * @modifies submitting, submitted, description, issueType states. Supabase database.
   * @effects Prevents default form submission. 
   *          Inserts a new record into the reports table with the current timestamp, 
   *          utility ID, issue type, and description. 
   *          On success, resets form fields and closes the modal. 
   *          On failure, logs the error.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    //console.log("Submitting report:", { issueType, description,  utility.name});
    setSubmitting(true);
    e.preventDefault();
    try {
      // Insert the report into the Supabase database
      const { data, error } = await supabase.from("reports").insert([
        {
          created_at: new Date().toISOString(), // Timestamp
          util_id: utility ? utility.id : "General Report", // Utility ID
          util_name: utility ? utility.name : "General Report", // Utility Name
          issue_type: issueType, // The issue type selected by the user
          description: description, // The description entered by the user
        },
      ]);

      if (error) {
        console.error("Error submitting report:", error.message);
        return;
      }

      console.log("Report submitted successfully:", data);

      // Optionally, show a success message or reset the form
      setSubmitted(true);
      setDescription("");
      setIssueType("");

      // Close the modal
      setShowReportModal(false); // Ensure this state exists and controls the modal visibility
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    if (!utility) return;
    console.log(`Report submitted for utility: ${utility.id}`);

  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-balance">Report an Issue</CardTitle>
              {utility && (
                <CardDescription className="text-pretty">
                  {utility.name} at {utility.building}
                </CardDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
              <X className="h-4 w-4" />
            </Button>
            
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">Report Submitted!</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Thank you for helping keep campus utilities up to date.
                </p>
              </div>
            </div>
            ) : (

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (submitting) return
                handleSubmit(e)
              }}
              className="space-y-4"
            >


              <div className="space-y-3">
                <Label>What's the issue?</Label>
                <RadioGroup value={issueType} onValueChange={setIssueType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-working" id="not-working" />
                    <Label htmlFor="not-working" className="font-normal cursor-pointer">
                      Not working
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maintenance" id="maintenance" />
                    <Label htmlFor="maintenance" className="font-normal cursor-pointer">
                      Needs maintenance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blocked" id="blocked" />
                    <Label htmlFor="blocked" className="font-normal cursor-pointer">
                      Blocked or inaccessible
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional details (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in more detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Report
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
