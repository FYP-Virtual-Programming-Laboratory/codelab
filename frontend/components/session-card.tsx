"use client"

import Link from "next/link"
import { MoreVertical, Users, Award, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SessionCardProps {
  id?: string
  title: string
  courseCode: string
  description: string
  status: "ONGOING" | "COMPLETED" | "CANCELLED"
  isCollaborative?: boolean
  participants: Array<{
    initial: string
    color?: string
    score?: number
    additionalCount?: number
  }>
  progress?: {
    current: number
    total: number
  }
  completedDate?: string
  averageScore?: number
  isAdmin?: boolean
}

export function SessionCard({
  id = "1",
  title,
  courseCode,
  description,
  status,
  isCollaborative = false,
  participants,
  progress,
  completedDate,
  averageScore,
  isAdmin = false,
}: SessionCardProps) {
  const statusColors = {
    ONGOING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  const statusDotColors = {
    ONGOING: "text-amber-500",
    COMPLETED: "text-green-500",
    CANCELLED: "text-red-500",
  }

  const getAvatarColor = (initial: string) => {
    const colors: Record<string, string> = {
      D: "bg-purple-500",
      C: "bg-amber-500",
      A: "bg-teal-500",
      F: "bg-green-500",
      S: "bg-pink-500",
      R: "bg-red-500",
      H: "bg-blue-500",
      M: "bg-orange-500",
    }
    return colors[initial] || "bg-gray-500"
  }

  // Determine the link URL based on session status and user role
  const getLinkUrl = () => {
    if (status === "COMPLETED") {
      return isAdmin ? `/admin_dashboard/sessions/${id}/grading` : `/student_dashboard/session/${id}/grading`
    }
    return isAdmin ? `/admin_dashboard/sessions/${id}` : `/student_dashboard/session/${id}`
  }

  return (
    <Link href={getLinkUrl()}>
      <Card
        className={cn(
          "bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          status === "COMPLETED" && "border-green-300 bg-green-50/30",
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`${statusColors[status]} rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5`}
              >
                <span className={`${statusDotColors[status]} text-lg leading-none`}>●</span>
                <span>{status}</span>
              </div>
              {isCollaborative && (
                <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  <span>Collaborative</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={(e) => e.preventDefault()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4 space-y-6">
          <div>
            <h3 className="font-semibold text-xl leading-tight mb-2 text-gray-900">
              {title}
              {courseCode && <span> - {courseCode}</span>}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {description.split(' ').slice(0, 20).join(' ') + (description.split(' ').length > 20 ? '...' : '')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {participants.map((participant, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-center rounded-full w-10 h-10 text-white font-medium text-sm",
                    getAvatarColor(participant.initial),
                  )}
                >
                  {participant.additionalCount ? (
                    <span>+{participant.additionalCount}</span>
                  ) : (
                    <span>{participant.initial}</span>
                  )}
                </div>
              ))}
            </div>
          {progress && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-white">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {progress.current} / {progress.total}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
