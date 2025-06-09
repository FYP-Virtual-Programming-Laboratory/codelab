"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Award, Calendar, CheckCircle, Clock } from "lucide-react"
import { Header } from "@/components/header"

const completedSessions = [
  {
    id: "3",
    title: "Database Management Systems Lab",
    courseCode: "CSC315",
    description: "Design and implement a relational database with proper normalization and query optimization.",
    status: "COMPLETED",
    instructor: "Dr. Sarah Johnson",
    startTime: "2025-01-15T09:00:00Z",
    endTime: "2025-01-15T12:00:00Z",
    grade: "A",
    score: 92,
    feedback: "Excellent work on the database design and normalization. Query optimization could be improved.",
  },
  {
    id: "4",
    title: "Computer Networks Assignment",
    courseCode: "CSC320",
    description: "Implement a simple client-server application using socket programming.",
    status: "COMPLETED",
    instructor: "Prof. David Wilson",
    startTime: "2025-01-22T14:00:00Z",
    endTime: "2025-01-22T17:00:00Z",
    grade: "B+",
    score: 85,
    feedback: "Good implementation of the client-server architecture. Error handling needs improvement.",
  },
  {
    id: "6",
    title: "Software Engineering Project",
    courseCode: "CSC401",
    description: "Develop a software application following proper software engineering principles and methodologies.",
    status: "COMPLETED",
    instructor: "Dr. Emily Brown",
    startTime: "2025-01-05T10:00:00Z",
    endTime: "2025-01-05T14:00:00Z",
    grade: "A-",
    score: 88,
    feedback: "Well-structured code and good documentation. Testing coverage could be more comprehensive.",
  },
]

export default function StudentGradesPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [studentName, setStudentName] = useState("Student User")
  const [averageScore, setAverageScore] = useState(0)

  useEffect(() => {
    if (email) {
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      setStudentName(name)
    }
    const total = completedSessions.reduce((sum, session) => sum + session.score, 0)
    setAverageScore(Math.round(total / completedSessions.length))
  }, [email])

  return (
    <>
      <Header title="My Grades" description="View your completed sessions and grades"/>
      <div className="px-4 sm:px-6 py-6 overflow-y-auto">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-xl shadow-xl p-6 sm:p-7 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Performance Summary</h2>
              <p className="text-blue-100 text-opacity-90 text-sm sm:text-base">Based on {completedSessions.length} completed sessions</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center bg-white bg-opacity-20 px-4 sm:px-5 py-2 sm:py-3 rounded-lg">
              <Award className="h-8 w-8 sm:h-9 sm:w-9 text-white mr-3 sm:mr-4" />
              <div>
                <p className="text-xs sm:text-sm text-blue-100 text-opacity-90">Average Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Sessions */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 sm:mb-6">Completed Sessions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {completedSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-200 ease-in-out flex flex-col">
              <div className="p-5 flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {session.courseCode}
                  </span>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="font-semibold">Completed</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h3>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{session.description}</p>

                    <div className="space-y-1 text-gray-600 text-sm mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-semibold">{new Date(session.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-semibold">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                          {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 h-fit rounded-lg w-full md:w-auto mt-4 md:mt-0 flex-shrink-0 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Grade:</span>
                      <span className="text-lg font-bold text-blue-700 mx-2">{session.grade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Score:</span>
                      <span className="text-lg font-bold text-blue-700 mx-2">{session.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructor Feedback:</h4>
                  <p className="text-gray-700 text-sm">{session.feedback}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link href={`/student_dashboard/sessions/${session.id}/grades`}>
                    <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-100 text-base font-medium py-2">
                      View Detailed Results
                    </Button>
                  </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
