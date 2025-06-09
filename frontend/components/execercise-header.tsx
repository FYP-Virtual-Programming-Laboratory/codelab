"use client"

import { useState, useEffect } from "react"
import { Clock, Code, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ExerciseHeaderProps {
  session: {
    title: string
    courseCode: string
    status: string
    endTime: string
    instructor: string
  }
  question: {
    title: string
    points: number
    timeLimit: string
  }
  userEmail: string
  sessionId: string
}

export function ExerciseHeader({ session, question, userEmail, sessionId }: ExerciseHeaderProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "S"

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(session.endTime).getTime()
      const now = new Date().getTime()
      const difference = endTime - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        )
      } else {
        setTimeLeft("00:00:00")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [session.endTime])

  const getStatusColor = (status: string) => {
    return status === "ONGOING" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
  }

  const isTimeRunningOut = timeLeft && timeLeft.split(":")[0] === "00" && Number.parseInt(timeLeft.split(":")[1]) < 30

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
              <Badge className="bg-white/20 text-white border-none">{session.courseCode}</Badge>
              <Badge className="bg-white/20 text-white border-none">
                <Award className="h-3 w-3 mr-1" />
                {question.points} pts
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <Clock className="h-3 w-3 mr-1" />
                {question.timeLimit}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Code className="h-6 w-6" />
              {question.title}
            </h2>
            <p className="text-white/80 text-sm">
              {session.title} - {session.instructor}
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mt-4">
            <div />
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isTimeRunningOut ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono font-semibold">{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
