"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SessionDetailHeaderProps {
  session: {
    title: string
    courseCode: string
    status: string
    endTime: string
    instructor: string
    isCollaborative: boolean
  }
  userEmail: string
}

export function SessionDetailHeader({ session, userEmail }: SessionDetailHeaderProps) {
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
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
              <Badge className="bg-white/20 text-white border-none">{session.courseCode}</Badge>
              {session.isCollaborative && (
                <Badge className="bg-white/20 text-white border-none">
                  <Users className="h-3 w-3 mr-1" />
                  Collaborative
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-1">{session.title}</h2>
            <p className="text-white/80 text-sm">Instructor: {session.instructor}</p>
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
