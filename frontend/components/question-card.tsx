"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, FileText, Target, Clock, Award, Code, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    description: string
    requirements: string[]
    inputData: string
    expectedOutput: string
    points: number
    timeLimit: string
  }
  questionNumber: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  sessionId: string
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  sessionId,
}: QuestionCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleWriteSolution = () => {
    router.push(
      `/student_dashboard/sessions/${sessionId}/exercises/${question.id}`
    )
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">{question.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge className="bg-teal-100 text-teal-700">
              <Award className="h-3 w-3 mr-1" />
              {question.points} pts
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{question.timeLimit}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </h3>
          <p className="text-gray-700">{question.description}</p>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Requirements
          </h3>
          <ul className="space-y-2">
            {question.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Write Solution Button */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="font-semibold text-lg mb-1">Ready to Code?</h3>
              <p className="text-white/80 text-sm">Open the solution editor to write and submit your code</p>
            </div>
            <Button
              onClick={handleWriteSolution}
              className="bg-white text-teal-800 hover:bg-white/90 font-semibold px-6 py-2"
            >
              Write Solution
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === questionNumber - 1 ? "bg-teal-600" : "bg-gray-300"}`}
              />
            ))}
          </div>

          <Button variant="outline" onClick={onNext} disabled={!canGoNext} className="flex items-center gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
