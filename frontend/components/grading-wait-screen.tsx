"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GradingWaitScreenProps {
  session: {
    id: string
    title: string
    courseCode: string
    instructor: string
  }
  userEmail: string
}

const gradingSteps = [
  { id: 1, name: "Compiling Code", description: "Checking syntax and compilation" },
  { id: 2, name: "Running Tests", description: "Executing test cases" },
  { id: 3, name: "Analyzing Performance", description: "Evaluating time and space complexity" },
  { id: 4, name: "Code Quality Check", description: "Reviewing code structure and style" },
  { id: 5, name: "Generating Report", description: "Preparing detailed feedback" },
]

export function GradingWaitScreen({ session, userEmail }: GradingWaitScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(30)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < gradingSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 600) // Change step every 600ms

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 2 // Increase by 2% every 60ms
        }
        return prev
      })
    }, 60)

    const timeInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 0) {
          return prev - 1
        }
        return 0
      })
    }, 100) // Update every 100ms for smoother countdown

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearInterval(timeInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Grading in Progress</h1>
          <p className="text-gray-600">
            Your submission for <span className="font-semibold">{session.title}</span> is being evaluated
          </p>
          <Badge variant="outline" className="bg-white">
            {session.courseCode} • {session.instructor}
          </Badge>
        </div>

        {/* Progress Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              Processing Submission
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Estimated time remaining: {timeRemaining}s</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Grading Steps */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Grading Steps</h3>
              <div className="space-y-3">
                {gradingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {index < currentStep ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : index === currentStep ? (
                        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${index <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                        {step.name}
                      </p>
                      <p className={`text-xs ${index <= currentStep ? "text-gray-600" : "text-gray-400"}`}>
                        {step.description}
                      </p>
                    </div>
                    {index < currentStep && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                    {index === currentStep && (
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                        In Progress
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What's happening?</p>
                  <p>
                    Our automated grading system is evaluating your code against multiple test cases, analyzing
                    performance metrics, and generating detailed feedback. You'll receive comprehensive results
                    including scores, suggestions, and areas for improvement.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Please don't close this window. You'll be redirected automatically when grading is complete.</p>
        </div>
      </div>
    </div>
  )
}
