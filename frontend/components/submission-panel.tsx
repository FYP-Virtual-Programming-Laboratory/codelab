"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Send, Save, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface SubmissionPanelProps {
  session: {
    languages: string[]
  }
  currentQuestion: {
    id: string
    title: string
    points: number
  }
  questionNumber: number
}

export function SubmissionPanel({ session, currentQuestion, questionNumber }: SubmissionPanelProps) {
  const [code, setCode] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState(session.languages[0])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSave = () => {
    // In a real app, save to backend
    console.log("Saving code:", { code, language: selectedLanguage, questionId: currentQuestion.id })
  }

  const handleSubmit = () => {
    // In a real app, submit to backend
    console.log("Submitting code:", { code, language: selectedLanguage, questionId: currentQuestion.id })
    setIsSubmitted(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCode(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Card className="bg-white border border-gray-200 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Solution
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Question {questionNumber}</Badge>
          <Badge className="bg-teal-100 text-teal-700">{currentQuestion.points} points</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div>
          <Label className="text-sm font-medium">Programming Language</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {session.languages.map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
                className={selectedLanguage === lang ? "bg-teal-800 hover:bg-teal-700" : ""}
              >
                {lang}
              </Button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label className="text-sm font-medium">Upload Code File</Label>
          <div className="mt-2">
            <input
              type="file"
              accept=".py,.cpp,.java,.js,.html,.css"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Code Editor */}
        <div>
          <Label className="text-sm font-medium">Code Editor</Label>
          <Textarea
            placeholder={`Write your ${selectedLanguage} code here...`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 font-mono text-sm min-h-[200px]"
          />
        </div>

        {/* Submission Status */}
        {isSubmitted && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Solution submitted successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} variant="outline" className="w-full" disabled={!code.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button
            onClick={handleSubmit}
            className="w-full bg-teal-800 hover:bg-teal-700 text-white"
            disabled={!code.trim() || isSubmitted}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitted ? "Submitted" : "Submit Solution"}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 pt-2">
          <p>• Save your work frequently</p>
          <p>• You can submit multiple times</p>
          <p>• Only your latest submission will be graded</p>
        </div>
      </CardContent>
    </Card>
  )
}
