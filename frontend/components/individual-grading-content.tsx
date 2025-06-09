"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Star,
  FileText,
  User,
  Calendar,
  Hash,
  Users,
  Award,
  TrendingUp,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  avatarColor: string
  role: "LEADER" | "MEMBER"
  contributionScore: number
  peerRating: number
}

interface ExerciseContribution {
  exerciseId: string
  exerciseTitle: string
  individualScore: number
  teamScore: number
  contributionPercentage: number
  linesOfCode: number
  commits: number
  testCasesWritten: number
  codeReviews: number
  collaborationRating: number
  specificContributions: string[]
}

interface TestCase {
  id: string
  name: string
  status: string
  score: number
  maxScore: number
  time: string
  input?: string
  expectedOutput?: string
  actualOutput?: string
  exitCode?: number
  error?: string
  contributedBy?: string
}

interface ExerciseFeedback {
  type: string
  title: string
  content: string
  icon: string
}

interface ExerciseData {
  id: string
  title: string
  description: string
  testCases: TestCase[]
  feedback: ExerciseFeedback[]
}

interface IndividualGradingContentProps {
  data: {
    student: {
      id: string
      name: string
      email: string
      matricNumber: string
      avatar: string
      avatarColor: string
    }
    session: {
      id: string
      title: string
      courseCode: string
      isCollaborative: boolean
      teamSize?: number
      collaborationType?: "PAIR_PROGRAMMING" | "GROUP_PROJECT" | "CODE_REVIEW"
    }
    team?: {
      id: string
      name: string
      members: TeamMember[]
      overallTeamScore: number
      collaborationScore: number
    }
    submission: {
      id: string
      submittedAt: string
      lastUpdated: string
      isTeamSubmission: boolean
    }
    exercises: ExerciseData[] // Changed from single exercise to array of exercises
    currentScore: number
    totalScore: number
    individualContributionScore: number
    exerciseContributions?: ExerciseContribution[]
    // Overall session feedback for the student
    overallFeedback: Array<{
      type: string
      title: string
      content: string
      icon: string
    }>
    collaborationFeedback?: {
      teamworkScore: number
      communicationScore: number
      leadershipScore: number
      peerReviews: Array<{
        fromStudent: string
        rating: number
        comment: string
      }>
    }
    finalScore: number
  }
}

export function IndividualGradingContent({ data }: IndividualGradingContentProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState(data.exercises[0]?.id || "")
  const selectedExercise = data.exercises.find((ex) => ex.id === selectedExerciseId)

  const [selectedTestCase, setSelectedTestCase] = useState(selectedExercise?.testCases[0]?.id || "")
  const [finalScore, setFinalScore] = useState(data.finalScore)
  const [customFeedback, setCustomFeedback] = useState("")
  const [contributionScore, setContributionScore] = useState(data.individualContributionScore)

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant =
      status.toLowerCase() === "passed" ? "default" : status.toLowerCase() === "failed" ? "destructive" : "secondary"
    return <Badge variant={variant}>{status}</Badge>
  }

  const getContributionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const selectedTest = selectedExercise?.testCases.find((tc) => tc.id === selectedTestCase)
  const selectedExerciseContribution = data.exerciseContributions?.find((ec) => ec.exerciseId === selectedExerciseId)

  return (
    <div className="p-6 space-y-6">
      {/* Student and Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Details */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <CardTitle className="text-lg">Student Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${data.student.avatarColor} text-white font-semibold`}>
                  {data.student.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{data.student.name}</h3>
                <p className="text-sm text-gray-600">{data.student.email}</p>
                <p className="text-sm text-gray-500">{data.student.matricNumber}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Submission ID:</span>
                <span className="font-mono">{data.submission.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Submitted:</span>
                <span>{data.submission.submittedAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Score */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Star className="h-5 w-5 text-gray-500 mr-2" />
            <CardTitle className="text-lg">Individual Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">
                {data.currentScore}/{data.totalScore}
              </div>
              {data.session.isCollaborative && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Contribution Score</p>
                  <div className="text-2xl font-semibold text-green-600">{data.individualContributionScore}/100</div>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Based on {selectedExercise?.testCases.length || 0} test cases for selected exercise
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Information (if collaborative) */}
        {data.session.isCollaborative && data.team && (
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <CardTitle className="text-lg">Team Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{data.team.name}</h3>
                <p className="text-sm text-gray-600">{data.team.members.length} members</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Score:</span>
                  <span className="font-semibold">{data.team.overallTeamScore}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Collaboration Score:</span>
                  <span className="font-semibold">{data.team.collaborationScore}/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Team Members</h4>
                {data.team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`${member.avatarColor} text-white text-xs`}>
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className={member.id === data.student.id ? "font-semibold" : ""}>
                        {member.name}
                        {member.role === "LEADER" && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Leader
                          </Badge>
                        )}
                      </span>
                    </div>
                    <span className="text-gray-500">{member.contributionScore}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exercises Section */}
      <Tabs defaultValue={selectedExerciseId} onValueChange={setSelectedExerciseId} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Exercises</h2>
          <TabsList>
            {data.exercises.map((exercise) => (
              <TabsTrigger key={exercise.id} value={exercise.id}>
                {exercise.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {data.exercises.map((exercise) => (
          <TabsContent key={exercise.id} value={exercise.id} className="space-y-6">
            {/* Exercise Details Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <CardTitle className="text-lg">Exercise: {exercise.title}</CardTitle>
                {data.session.isCollaborative && (
                  <Badge variant="outline" className="ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    {data.session.collaborationType?.replace("_", " ")}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{exercise.description}</p>
              </CardContent>
            </Card>

            {/* Test Case Results for current exercise */}
            <Card>
              <CardHeader>
                <CardTitle>Test Case Results for {exercise.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Test Case</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Score</th>
                        <th className="text-left py-2">Time</th>
                        {data.session.isCollaborative && <th className="text-left py-2">Contributed By</th>}
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.testCases.map((testCase) => (
                        <tr key={testCase.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(testCase.status)}
                              <span className="font-medium">{testCase.name}</span>
                            </div>
                          </td>
                          <td className="py-3">{getStatusBadge(testCase.status)}</td>
                          <td className="py-3">
                            <span className="font-mono">
                              {testCase.score}/{testCase.maxScore}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-mono text-sm">{testCase.time}</span>
                          </td>
                          {data.session.isCollaborative && (
                            <td className="py-3">
                              <span className="text-sm">{testCase.contributedBy || "Team"}</span>
                            </td>
                          )}
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedTestCase(testCase.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback for {exercise.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exercise.feedback.map((feedback, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{feedback.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{feedback.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Overall Session Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Session Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.overallFeedback.map((feedback, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">{feedback.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium">{feedback.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="custom-feedback">Add Custom Feedback</Label>
            <Textarea
              id="custom-feedback"
              placeholder="Type your feedback here..."
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Collaborative Session Tabs (moved to be separate from exercises) */}
      {data.session.isCollaborative && (
        <Tabs defaultValue="contributions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="contributions">Exercise Contributions</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="contributions">
            {data.exerciseContributions && (
              <Card>
                <CardHeader>
                  <CardTitle>Individual Contributions by Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Exercise Selection */}
                    <div className="flex flex-wrap gap-2">
                      {data.exerciseContributions.map((exercise) => (
                        <Button
                          key={exercise.exerciseId}
                          variant={selectedExerciseId === exercise.exerciseId ? "default" : "outline"}
                          onClick={() => setSelectedExerciseId(exercise.exerciseId)}
                          size="sm"
                        >
                          {exercise.exerciseTitle}
                        </Button>
                      ))}
                    </div>

                    {/* Selected Exercise Details */}
                    {selectedExerciseContribution && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Award className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm font-medium">Individual Score</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">
                                  {selectedExerciseContribution.individualScore}/100
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-medium">Team Score</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">
                                  {selectedExerciseContribution.teamScore}/100
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-purple-600" />
                                  <span className="text-sm font-medium">Contribution</span>
                                </div>
                                <span
                                  className={`text-lg font-bold ${getContributionColor(selectedExerciseContribution.contributionPercentage)}`}
                                >
                                  {selectedExerciseContribution.contributionPercentage}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-yellow-50 border-yellow-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="h-5 w-5 text-yellow-600" />
                                  <span className="text-sm font-medium">Collaboration</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-600">
                                  {selectedExerciseContribution.collaborationRating}/5
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Code Contribution Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Lines of Code</span>
                                <span className="font-semibold">{selectedExerciseContribution.linesOfCode}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Commits</span>
                                <span className="font-semibold">{selectedExerciseContribution.commits}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Test Cases Written</span>
                                <span className="font-semibold">{selectedExerciseContribution.testCasesWritten}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Code Reviews</span>
                                <span className="font-semibold">{selectedExerciseContribution.codeReviews}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Specific Contributions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {selectedExerciseContribution.specificContributions.map((contribution, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{contribution}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collaboration">
            {data.collaborationFeedback && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Collaboration Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Teamwork</span>
                          <span className="text-sm">{data.collaborationFeedback.teamworkScore}/100</span>
                        </div>
                        <Progress value={data.collaborationFeedback.teamworkScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Communication</span>
                          <span className="text-sm">{data.collaborationFeedback.communicationScore}/100</span>
                        </div>
                        <Progress value={data.collaborationFeedback.communicationScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Leadership</span>
                          <span className="text-sm">{data.collaborationFeedback.leadershipScore}/100</span>
                        </div>
                        <Progress value={data.collaborationFeedback.leadershipScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.collaborationFeedback.peerReviews.map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">From: {review.fromStudent}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Grade Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Adjustment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="final-score">Final Score (0-100)</Label>
              <Input
                id="final-score"
                type="number"
                min="0"
                max="100"
                value={finalScore}
                onChange={(e) => setFinalScore(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            {data.session.isCollaborative && (
              <div className="flex-1">
                <Label htmlFor="contribution-score">Contribution Score (0-100)</Label>
                <Input
                  id="contribution-score"
                  type="number"
                  min="0"
                  max="100"
                  value={contributionScore}
                  onChange={(e) => setContributionScore(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline">Save Draft</Button>
            <Button>Submit Final Grade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
