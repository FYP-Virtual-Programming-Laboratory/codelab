import { Calendar, Clock, Code, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SessionInfoCardProps {
  session: {
    title: string
    courseCode: string
    instructor: string
    duration: string
    languages: string[]
    startTime: string
    endTime: string
  }
}

export function SessionInfoCard({ session }: SessionInfoCardProps) {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Session Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Instructor</p>
            <p className="font-medium">{session.instructor}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{session.duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Schedule</p>
            <p className="font-medium">{formatDate(session.startTime)}</p>
            <p className="text-sm text-gray-500">
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-600">Languages</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.languages.map((lang) => (
              <Badge key={lang} variant="outline" className="bg-gray-50">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
