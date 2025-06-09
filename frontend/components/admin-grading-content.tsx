"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Calendar,
  Award,
  TrendingUp,
  PieChart,
} from "lucide-react"

interface AdminGradingContentProps {
  data: {
    session: {
      id: string
      title: string
      courseCode: string
      instructor: string
      totalStudents: number
      submittedCount: number
      gradedCount: number
      pendingCount: number
      averageScore: number
      completionRate: number
      submissionDeadline: string
    }
    exercises: Array<{
      id: string
      title: string
      weight: number
      averageScore: number
      passRate: number
    }>
    students: Array<{
      id: string
      name: string
      email: string
      matricNumber: string
      avatar: string
      avatarColor: string
      submissionStatus: "GRADED" | "PENDING" | "NOT_SUBMITTED"
      submittedAt: string | null
      gradedAt: string | null
      overallScore: number | null
      maxScore: number
      exerciseScores: Array<{
        exerciseId: string
        score: number
        maxScore: number
      }>
      gradedBy: string | null
    }>
    analytics: {
      gradeDistribution: Array<{
        range: string
        count: number
        percentage: number
      }>
      submissionTrend: Array<{
        date: string
        submissions: number
      }>
    }
  }
}

export function AdminGradingContent({ data }: AdminGradingContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("name")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRADED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Graded
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "NOT_SUBMITTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Not Submitted
          </Badge>
        )
      default:
        return null
    }
  }

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return "text-gray-400"
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredStudents = data.students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || student.submissionStatus === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "score":
          return (b.overallScore || 0) - (a.overallScore || 0)
        case "submitted":
          return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="p-6 space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium ml-2">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.session.totalStudents}</div>
            <p className="text-xs text-gray-500">Enrolled in session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium ml-2">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.session.submittedCount}</div>
            <p className="text-xs text-gray-500">{data.session.completionRate.toFixed(1)}% completion rate</p>
            <Progress value={data.session.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CheckCircle className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium ml-2">Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.session.gradedCount}</div>
            <p className="text-xs text-gray-500">{data.session.pendingCount} pending</p>
            <Progress value={(data.session.gradedCount / data.session.submittedCount) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Award className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-medium ml-2">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.session.averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg">{data.session.title}</h3>
              <p className="text-gray-600">{data.session.courseCode}</p>
              <p className="text-sm text-gray-500 mt-1">Instructor: {data.session.instructor}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Submission Deadline</span>
              </div>
              <p className="font-medium">{data.session.submissionDeadline}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Exercise Breakdown</h4>
              {data.exercises.map((exercise) => (
                <div key={exercise.id} className="flex justify-between text-sm">
                  <span className="truncate pr-2">{exercise.title}</span>
                  <span className="text-gray-500">{exercise.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics and Student Management */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Submissions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Grades
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Bulk Actions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="GRADED">Graded</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="submitted">Submission Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Student Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Graded By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${student.avatarColor} text-white text-sm`}>
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.matricNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.submissionStatus)}</TableCell>
                        <TableCell>
                          {student.submittedAt ? (
                            <div>
                              <p className="text-sm">{student.submittedAt}</p>
                              {student.gradedAt && <p className="text-xs text-gray-500">Graded: {student.gradedAt}</p>}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not submitted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.overallScore !== null ? (
                            <span className={`font-semibold ${getScoreColor(student.overallScore, student.maxScore)}`}>
                              {student.overallScore}/{student.maxScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.gradedBy ? (
                            <span className="text-sm">{student.gradedBy}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {student.submissionStatus !== "NOT_SUBMITTED" && (
                              <>
                                <Link href={`/sessions/${data.session.id}/grading/${student.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analytics.gradeDistribution.map((grade) => (
                    <div key={grade.range} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium">{grade.range}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{grade.count} students</span>
                        <span className="text-sm font-medium">{grade.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submission Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Submission Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analytics.submissionTrend.map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(day.submissions / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{day.submissions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Exercise Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.exercises.map((exercise) => (
                  <div key={exercise.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <p className="text-sm text-gray-500">Weight: {exercise.weight}%</p>
                      </div>
                      <Badge variant="outline">{exercise.averageScore.toFixed(1)} avg</Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Score</span>
                          <span>{exercise.averageScore.toFixed(1)}/100</span>
                        </div>
                        <Progress value={exercise.averageScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Pass Rate</span>
                          <span>{exercise.passRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={exercise.passRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
