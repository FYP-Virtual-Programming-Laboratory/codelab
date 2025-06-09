"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { StudentLayout } from "@/components/student-layout"
import { StudentPageHeader } from "@/components/student-page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Code, FileText } from "lucide-react"

// Mock grading data
const mockGradingData = {
  session: {
    title: "Advanced Data Structures Lab",
    courseCode: "CSC310",
    instructor: "Dr. Michael Chen",
    status: "COMPLETED",
  },
  overallGrade: "A-",
  overallScore: 88,
  totalPoints: 100,
  earnedPoints: 88,
  submissionTime: "2025-01-20T14:30:00Z",
  questions: [
    {
      id: "q1",
      title: "Binary Search Tree Implementation",
      points: 25,
      earnedPoints: 23,
      status: "CORRECT",
      feedback: "Excellent implementation with proper balancing. Minor optimization opportunity in deletion method.",
      testCases: {
        passed: 8,
        total: 10,
      },
    },
    {
      id: "q2",
      title: "Graph Traversal Algorithms",
      points: 30,
      earnedPoints: 28,
      status: "CORRECT",
      feedback: "Good understanding of BFS and DFS. Code is clean and well-commented.",
      testCases: {
        passed: 9,
        total: 10,
      },
    },
    {
      id: "q3",
      title: "Dynamic Programming Solution",
      points: 25,
      earnedPoints: 20,
      status: "PARTIAL",
      feedback: "Correct approach but inefficient time complexity. Consider memoization techniques.",
      testCases: {
        passed: 6,
        total: 10,
      },
    },
    {
      id: "q4",
      title: "Hash Table Design",
      points: 20,
      earnedPoints: 17,
      status: "CORRECT",
      feedback: "Solid implementation with good collision handling strategy.",
      testCases: {
        passed: 8,
        total: 10,
      },
    },
  ],
}

export default function StudentGradingPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const email = searchParams.get("email") || ""
  const sessionId = params.sessionId as string
  const [studentName, setStudentName] = useState("Student User")

  useEffect(() => {
    if (email) {
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      setStudentName(name)
    }
  }, [email])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CORRECT":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "PARTIAL":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "INCORRECT":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CORRECT":
        return "bg-green-100 text-green-800"
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800"
      case "INCORRECT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pageHeader = (
    <StudentPageHeader
      title="Grading Results"
      description={`${mockGradingData.session.title} - ${mockGradingData.session.courseCode}`}
      userEmail={email}
      showUserInfo={true}
    />
  )

  return (
    <StudentLayout studentEmail={email} studentName={studentName} pageSpecificHeader={pageHeader}>
      <div className="container mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href={`/student_dashboard/session/${sessionId}?email=${encodeURIComponent(email)}`}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Session
            </Button>
          </Link>
        </div>

        {/* Overall Results Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Overall Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockGradingData.overallGrade}</div>
                <div className="text-sm text-gray-600">Final Grade</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockGradingData.overallScore}%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {mockGradingData.earnedPoints}/{mockGradingData.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(mockGradingData.submissionTime).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Results
          </h2>

          {mockGradingData.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(question.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                      <Badge className={getStatusColor(question.status)}>{question.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{question.feedback}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-blue-600">
                      {question.earnedPoints}/{question.points}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Test Cases: {question.testCases.passed}/{question.testCases.total} passed
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/student_dashboard/session/${sessionId}/solution/${question.id}?email=${encodeURIComponent(email)}`}
                  >
                    <Button variant="outline" size="sm">
                      View Solution
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href={`/student_dashboard/grades?email=${encodeURIComponent(email)}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              View All Grades
            </Button>
          </Link>
          <Link href={`/student_dashboard/sessions?email=${encodeURIComponent(email)}`}>
            <Button className="w-full sm:w-auto">Back to Sessions</Button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  )
}
