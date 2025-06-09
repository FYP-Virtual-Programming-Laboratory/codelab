"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Trophy, Calendar, Clock, User, Crown, BarChart3 } from "lucide-react"

interface GroupGradingContentProps {
  data: {
    group: {
      id: string
      name: string
      leader: string
    }
    session: {
      id: string
      title: string
      courseCode: string
    }
    exercises: Array<{
      id: string
      title: string
      description: string
      totalScore: number
    }>
    students: Array<{
      id: string
      name: string
      email: string
      matricNumber: string
      avatar: string
      avatarColor: string
      role: string
      scores: Array<{
        exerciseId: string
        score: number
        contribution: number
      }>
      totalScore: number
      overallContribution: number
    }>
    groupScore: number
    submittedAt: string
    lastUpdated: string
  }
}

export function GroupGradingContent({ data }: GroupGradingContentProps) {
  const [selectedExercise, setSelectedExercise] = useState(data.exercises[0]?.id || "")

  const getContributionColor = (contribution: number) => {
    if (contribution >= 40) return "text-green-600"
    if (contribution >= 30) return "text-blue-600"
    if (contribution >= 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Group Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Group Details */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <CardTitle className="text-lg">Group Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-xl">{data.group.name}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                Leader: {data.group.leader}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Submitted:</span>
                <span>{data.submittedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last Updated:</span>
                <span>{data.lastUpdated}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Score */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Trophy className="h-5 w-5 text-gray-500 mr-2" />
            <CardTitle className="text-lg">Group Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">{data.groupScore}/100</div>
              <Progress value={data.groupScore} className="w-full" />
              <p className="text-sm text-gray-600">Average across all exercises</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
            <CardTitle className="text-lg">Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Team Members:</span>
              <span className="font-semibold">{data.students.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Exercises:</span>
              <span className="font-semibold">{data.exercises.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Score:</span>
              <span className="font-semibold">{data.groupScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.exercises.map((exercise) => (
              <Button
                key={exercise.id}
                variant={selectedExercise === exercise.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedExercise(exercise.id)}
              >
                {exercise.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance & Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Student</th>
                  <th className="text-left py-3">Role</th>
                  <th className="text-left py-3">Overall Score</th>
                  <th className="text-left py-3">Overall Contribution</th>
                  {data.exercises.map((exercise) => (
                    <th key={exercise.id} className="text-left py-3">
                      {exercise.title}
                    </th>
                  ))}
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${student.avatarColor} text-white font-semibold`}>
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.matricNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {student.role === "Team Leader" && <Crown className="h-3 w-3 text-yellow-500" />}
                        {student.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <span className={`font-semibold ${getScoreColor(student.totalScore)}`}>
                        {student.totalScore}%
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getContributionColor(student.overallContribution)}`}>
                          {student.overallContribution.toFixed(1)}%
                        </span>
                        <Progress value={student.overallContribution} className="w-16 h-2" />
                      </div>
                    </td>
                    {data.exercises.map((exercise) => {
                      const exerciseScore = student.scores.find((s) => s.exerciseId === exercise.id)
                      return (
                        <td key={exercise.id} className="py-4">
                          <div className="text-center">
                            <div className={`font-semibold ${getScoreColor(exerciseScore?.score || 0)}`}>
                              {exerciseScore?.score || 0}%
                            </div>
                            <div className="text-xs text-gray-500">{exerciseScore?.contribution || 0}% contrib.</div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="py-4">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Contribution Breakdown */}
      {selectedExercise && (
        <Card>
          <CardHeader>
            <CardTitle>
              Contribution Breakdown - {data.exercises.find((e) => e.id === selectedExercise)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.students.map((student) => {
                const exerciseData = student.scores.find((s) => s.exerciseId === selectedExercise)
                return (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${student.avatarColor} text-white text-sm`}>
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className={`font-semibold ${getScoreColor(exerciseData?.score || 0)}`}>
                          {exerciseData?.score || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Contribution:</span>
                        <span className={`font-semibold ${getContributionColor(exerciseData?.contribution || 0)}`}>
                          {exerciseData?.contribution || 0}%
                        </span>
                      </div>
                      <Progress value={exerciseData?.contribution || 0} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline">Export Report</Button>
        <Button variant="outline">Send Feedback</Button>
        <Button>Save Grades</Button>
      </div>
    </div>
  )
}
