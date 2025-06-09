"use client"

import { useState } from "react"
import { X, Check, Calendar, Clock, Info, Plus, Upload, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface CreateSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const [step, setStep] = useState(1)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Python"])
  const [enrollmentMethod, setEnrollmentMethod] = useState("link")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const steps = [
    { id: 1, name: "Session Initialization", completed: step > 1 },
    { id: 2, name: "Content configuration", completed: step > 2 },
    { id: 3, name: "Group management", completed: step > 3 },
    { id: 4, name: "Student enrollment", completed: step > 4 },
    { id: 5, name: "Confirmation", completed: false },
  ]

  const handleAddLanguage = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }

  const handleRemoveLanguage = (language: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l !== language))
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Select supported programming languages</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedLanguages.map((lang) => (
                  <div
                    key={lang}
                    className="bg-teal-100 text-teal-800 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
                  >
                    {lang}
                    <button onClick={() => handleRemoveLanguage(lang)} className="hover:bg-teal-200 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {["MySQL", "C#", "Matlab"]
                  .filter((lang) => !selectedLanguages.includes(lang))
                  .map((lang) => (
                    <Button
                      key={lang}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLanguage(lang)}
                      className="text-xs"
                    >
                      {lang}
                    </Button>
                  ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Set duration for the session</Label>
              <div className="flex items-center gap-2 mt-3">
                <Input type="number" placeholder="Enter number" className="flex-1" />
                <Select defaultValue="hours">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">When will this session start?</Label>
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Input placeholder="Select date" />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input placeholder="Select time" />
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">When will this session end?</Label>
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Input placeholder="Select date" />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input placeholder="Select time" />
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Session name or tag</Label>
              <Input
                placeholder="Enter a name or tag for this session (e.g. Web Development Practical)"
                className="mt-3"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Question 1</Label>
              <Input placeholder="Enter question 1" className="mt-3" />
            </div>

            <div>
              <Label className="text-sm font-medium">Instruction for question 1 (if any)</Label>
              <Textarea placeholder="Enter instruction" className="mt-3" rows={3} />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="attach" />
              <Label htmlFor="attach" className="text-sm">
                Attach this instruction for all questions.
              </Label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Set question 1 value</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set the score or weight for this question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Input type="number" placeholder="Enter total score/weight" className="flex-1" />
                <Select defaultValue="percentage">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Enter score percentage</SelectItem>
                    <SelectItem value="points">Enter points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Input data for question 1</Label>
              <Input placeholder="Enter input data or link" className="mt-3" />
            </div>

            <div>
              <Label className="text-sm font-medium">Expected output for question 1</Label>
              <Textarea placeholder="Enter expected output" className="mt-3" rows={3} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch id="review" />
                <Label htmlFor="review" className="text-sm">
                  Allow students to get review report after grading
                </Label>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add another question
            </Button>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Collaborative work settings</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configure how students will collaborate in this session</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select defaultValue="single">
                <SelectTrigger className="w-full mt-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single work group for the entire session</SelectItem>
                  <SelectItem value="multiple">Multiple work groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Group access type</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Control who can access the group</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select defaultValue="open">
                <SelectTrigger className="w-full mt-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Enrollment method</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose how students will enroll in this session</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={enrollmentMethod} onValueChange={setEnrollmentMethod}>
                <SelectTrigger className="w-full mt-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Add students from file</SelectItem>
                  <SelectItem value="link">Share invitation link</SelectItem>
                  <SelectItem value="direct">Direct invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {enrollmentMethod === "file" && (
              <div>
                {!uploadedFile ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={handleFileUpload}
                  >
                    <div className="flex flex-col items-center">
                      <div className="rounded-full p-3 bg-gray-100">
                        <Upload className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="mt-2 font-medium text-gray-900">Click to upload</p>
                      <p className="text-sm text-gray-500">CSV or XLS file up to 10mb</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{uploadedFile}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            )}

            {enrollmentMethod === "link" && (
              <div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-mono">sessionmgtsite.com/session/s3201</span>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            )}

            {enrollmentMethod === "direct" && (
              <div>
                <Label className="text-sm font-medium">Email address to invite</Label>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Enter email address" className="flex-1" />
                  <Button className="bg-teal-800 hover:bg-teal-700 text-white">Add</Button>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">When will invitation expire? (Optional)</Label>
              <div className="flex items-center gap-2 mt-3">
                <Input type="number" placeholder="Enter number" className="flex-1" />
                <Select defaultValue="hours">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">All set?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Clicking the Submit button below confirms that all has been set for this session.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedFile("csc300M.csv")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create session</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex gap-8 flex-1 overflow-hidden">
          {/* Steps sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-4">
              {steps.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      s.id === step
                        ? "bg-teal-800 text-white"
                        : s.completed
                          ? "bg-teal-800 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.completed ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <h3 className={`text-sm font-medium ${s.id === step ? "text-gray-900" : "text-gray-600"}`}>
                      {s.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content area - now properly scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="pr-6 pb-6">{renderStepContent()}</div>
          </div>
        </div>

        {/* Footer - fixed at bottom */}
        <div className="flex justify-between items-center pt-4 border-t bg-white">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Discard changes
            </Button>
          )}

          <div className="flex gap-2">
            {step < 5 && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Discard changes
              </Button>
            )}
            {step < 5 ? (
              <Button className="bg-teal-800 hover:bg-teal-700 text-white" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button
                className="bg-teal-800 hover:bg-teal-700 text-white"
                onClick={() => {
                  onOpenChange(false)
                  setStep(1)
                }}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
