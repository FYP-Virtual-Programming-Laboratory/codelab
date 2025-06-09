import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GroupSelectionHeaderProps {
  session: {
    title: string
    courseCode: string
    status: string
    maxGroupSize: number
  }
  email: string
}

export function GroupSelectionHeader({ session, email }: GroupSelectionHeaderProps) {
  // Get first letter of email for avatar
  const initial = email ? email.charAt(0).toUpperCase() : "S"

  const getStatusColor = (status: string) => {
    return status === "ONGOING" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href={`/enroll?email=${encodeURIComponent(email)}`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">Select Collaborative Group</h1>
              <p className="text-sm text-gray-600">Choose a group to join or create a new one</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{email}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-teal-600 text-white">{initial}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-lg p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                <Badge className="bg-white/20 text-white border-none">{session.courseCode}</Badge>
                <Badge className="bg-white/20 text-white border-none">
                  <Users className="h-3 w-3 mr-1" />
                  Max {session.maxGroupSize} per group
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-1">{session.title}</h2>
              <p className="text-white/80 text-sm">
                This is a collaborative session. Join an existing group or create your own to work together with other
                students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
