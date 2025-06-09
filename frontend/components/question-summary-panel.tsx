import { FileText, Target, Award, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuestionSummaryPanelProps {
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
}

export function QuestionSummaryPanel({ question }: QuestionSummaryPanelProps) {
  return (
    <Card className="bg-white border border-gray-200 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Question Summary
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-100 text-teal-700">
            <Award className="h-3 w-3 mr-1" />
            {question.points} pts
          </Badge>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {question.timeLimit}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">{question.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{question.description}</p>
        </div>

        {/* Requirements */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Requirements
          </h4>
          <ul className="space-y-2">
            {question.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
