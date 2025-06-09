import { TestTube, Eye, EyeOff, Award, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TestCase {
  id: string
  name: string
  input: string
  expectedOutput: string
  points: number
  isHidden: boolean
}

interface EvaluationCriteria {
  id: string
  name: string
  description: string
  points: number
}

interface TestCasesPanelProps {
  testCases: TestCase[]
  evaluationCriteria: EvaluationCriteria[]
  questionNumber: number
}

export function TestCasesPanel({ testCases, evaluationCriteria, questionNumber }: TestCasesPanelProps) {
  const visibleTestCases = testCases.filter((tc) => !tc.isHidden)
  const hiddenTestCases = testCases.filter((tc) => tc.isHidden)
  const totalTestCasePoints = testCases.reduce((sum, tc) => sum + tc.points, 0)
  const totalEvaluationPoints = evaluationCriteria.reduce((sum, ec) => sum + ec.points, 0)

  return (
    <Card className="bg-white border border-gray-200 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Cases & Evaluation
        </CardTitle>
        <Badge variant="outline">Question {questionNumber}</Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visible Test Cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              Visible Test Cases
            </h3>
            <Badge className="bg-green-100 text-green-700">
              {visibleTestCases.reduce((sum, tc) => sum + tc.points, 0)} pts
            </Badge>
          </div>
          <div className="space-y-3">
            {visibleTestCases.map((testCase, index) => (
              <div key={testCase.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{testCase.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {testCase.points} pts
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Input:</span>
                    <div className="bg-white p-2 rounded border mt-1">
                      <code className="text-gray-800">{testCase.input}</code>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expected Output:</span>
                    <div className="bg-green-50 p-2 rounded border border-green-200 mt-1">
                      <code className="text-green-800">{testCase.expectedOutput}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Test Cases */}
        {hiddenTestCases.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-gray-500" />
                Hidden Test Cases
              </h3>
              <Badge className="bg-gray-100 text-gray-700">
                {hiddenTestCases.reduce((sum, tc) => sum + tc.points, 0)} pts
              </Badge>
            </div>
            <div className="space-y-2">
              {hiddenTestCases.map((testCase, index) => (
                <div key={testCase.id} className="border border-gray-200 rounded-lg p-3 bg-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-600">{testCase.name}</h4>
                    <Badge variant="outline" className="text-xs bg-gray-200">
                      {testCase.points} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Details hidden until submission</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Evaluation Criteria */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Evaluation Criteria
            </h3>
            <Badge className="bg-blue-100 text-blue-700">{totalEvaluationPoints} pts</Badge>
          </div>
          <div className="space-y-3">
            {evaluationCriteria.map((criteria) => (
              <div key={criteria.id} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-blue-900">{criteria.name}</h4>
                  <Badge className="bg-blue-200 text-blue-800 text-xs">{criteria.points} pts</Badge>
                </div>
                <p className="text-xs text-blue-700">{criteria.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3 border">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Points Summary
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Test Cases:</span>
              <span className="font-medium">{totalTestCasePoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Evaluation:</span>
              <span className="font-medium">{totalEvaluationPoints} pts</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">{totalTestCasePoints + totalEvaluationPoints} pts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
