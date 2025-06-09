import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Users, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminGradingDashboard({ params }: { params: { id: string } }) {
  // Mock data for the grading dashboard - expanded to include session 4
  const getSessionData = (sessionId: string) => {
    const sessionData: Record<string, any> = {
      "1": {
        id: "1",
        title: "Data Structures Lab Assignment",
        courseCode: "CSC301",
        instructor: "Dr. Jane Smith",
        deadline: "May 10, 2023",
        totalStudents: 82,
        submittedCount: 78,
        gradedCount: 65,
        averageScore: 87,
        exercises: [
          { name: "Linked Lists", weight: 30, averageScore: 85 },
          { name: "Binary Trees", weight: 40, averageScore: 88 },
          { name: "Hash Tables", weight: 30, averageScore: 82 },
        ],
        students: [
          { id: "1", name: "John Smith", email: "john@example.com", status: "GRADED", score: 85 },
          { id: "2", name: "Sarah Johnson", email: "sarah@example.com", status: "GRADED", score: 91 },
          { id: "3", name: "Mike Chen", email: "mike@example.com", status: "PENDING", score: null },
        ],
      },
      "3": {
        id: "3",
        title: "Algorithms Weekly Task",
        courseCode: "CSC502",
        instructor: "Dr. Sarah Wilson",
        deadline: "February 5, 2025",
        totalStudents: 5,
        submittedCount: 5,
        gradedCount: 5,
        averageScore: 88,
        exercises: [
          { name: "Sorting Algorithms", weight: 40, averageScore: 90 },
          { name: "Dynamic Programming", weight: 35, averageScore: 85 },
          { name: "Graph Traversal", weight: 25, averageScore: 89 },
        ],
        students: [
          { id: "17", name: "Noah Williams", email: "noahwilliams@example.com", status: "GRADED", score: 92 },
          { id: "18", name: "Emma Davis", email: "emmadavis@example.com", status: "GRADED", score: 87 },
          { id: "19", name: "Liam Miller", email: "liammiller@example.com", status: "GRADED", score: 85 },
          { id: "20", name: "Ava Wilson", email: "avawilson@example.com", status: "GRADED", score: 90 },
          { id: "21", name: "William Brown", email: "williambrown@example.com", status: "GRADED", score: 86 },
        ],
      },
      "4": {
        id: "4",
        title: "Web Development Team Project",
        courseCode: "CSC411",
        instructor: "Prof. Michael Chen",
        deadline: "June 10, 2023",
        totalStudents: 16,
        submittedCount: 16,
        gradedCount: 14,
        averageScore: 89,
        exercises: [
          { name: "Frontend Development", weight: 40, averageScore: 91 },
          { name: "Backend Development", weight: 35, averageScore: 87 },
          { name: "Database Design", weight: 25, averageScore: 90 },
        ],
        students: [
          { id: "s1", name: "Alice Johnson", email: "alice@example.com", status: "GRADED", score: 92 },
          { id: "s2", name: "Bob Smith", email: "bob@example.com", status: "GRADED", score: 85 },
          { id: "s3", name: "Charlie Brown", email: "charlie@example.com", status: "GRADED", score: 78 },
          { id: "s4", name: "Diana Prince", email: "diana@example.com", status: "GRADED", score: 88 },
          { id: "s5", name: "Edward Norton", email: "edward@example.com", status: "PENDING", score: null },
          { id: "s6", name: "Fiona Apple", email: "fiona@example.com", status: "GRADED", score: 95 },
          { id: "s7", name: "George Lucas", email: "george@example.com", status: "GRADED", score: 82 },
          { id: "s8", name: "Hannah Montana", email: "hannah@example.com", status: "GRADED", score: 90 },
        ],
      },
    }
    return sessionData[sessionId]
  }

  const sessionData = getSessionData(params.id)

  if (!sessionData) {
    return (
      <>
        <Header title="Session Not Found" description="The requested session could not be found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
            <Link href="/sessions">
              <Button>Back to Sessions</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const submissionPercentage = Math.round((sessionData.submittedCount / sessionData.totalStudents) * 100)
  const gradingPercentage = Math.round((sessionData.gradedCount / sessionData.submittedCount) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GRADED":
        return "text-green-600 bg-green-50 border-green-200"
      case "PENDING":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "NOT_SUBMITTED":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "GRADED":
        return <CheckCircle className="h-4 w-4" />
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "NOT_SUBMITTED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <>
      <Header
        title={`${sessionData.title} - Grading`}
        description={`${sessionData.courseCode} • Instructor: ${sessionData.instructor}`}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Session Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{sessionData.totalStudents}</div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Submissions</span>
                  <span>{submissionPercentage}%</span>
                </div>
                <Progress value={submissionPercentage} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {sessionData.submittedCount}/{sessionData.totalStudents}
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Completion</span>
                  <span>{submissionPercentage}%</span>
                </div>
                <Progress value={submissionPercentage} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Grading Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {sessionData.gradedCount}/{sessionData.submittedCount}
                </div>
                <CheckCircle className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Graded</span>
                  <span>{gradingPercentage}%</span>
                </div>
                <Progress value={gradingPercentage} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{sessionData.averageScore}%</div>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Performance</span>
                  <span>
                    {sessionData.averageScore >= 85 ? "Excellent" : sessionData.averageScore >= 70 ? "Good" : "Average"}
                  </span>
                </div>
                <Progress value={sessionData.averageScore} className="h-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="students">
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>View and manage student submissions for this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Student
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Score
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionData.students.map((student: any) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}
                            >
                              {getStatusIcon(student.status)}
                              {student.status === "GRADED"
                                ? "Graded"
                                : student.status === "PENDING"
                                  ? "Pending"
                                  : "Not Submitted"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.score !== null ? `${student.score}%` : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {student.status !== "NOT_SUBMITTED" && (
                              <Link href={`/admin_dashboard/sessions/${params.id}/grading/${student.id}`}>
                                <Button variant="outline" size="sm">
                                  {student.status === "GRADED" ? "Review" : "Grade"}
                                </Button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Overview of grade distribution across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50">
                  <p className="text-gray-500">Grade distribution chart would appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Performance</CardTitle>
                <CardDescription>Performance breakdown by exercise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionData.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <p className="text-sm text-gray-500">Weight: {exercise.weight}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{exercise.averageScore}%</p>
                          <p className="text-sm text-gray-500">Average Score</p>
                        </div>
                      </div>
                      <Progress value={exercise.averageScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
