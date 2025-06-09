"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, StopCircle } from "lucide-react"

interface ActiveSession {
  id: string
  student: string
  course: string
  language: string
  duration: string
  cpuUsage: number
  memoryUsage: number
  status: "active" | "idle" | "building"
}

export function ActiveSessionsTable() {
  const activeSessions: ActiveSession[] = [
    {
      id: "sess_001",
      student: "John Doe",
      course: "CS101",
      language: "Python",
      duration: "45m 23s",
      cpuUsage: 23,
      memoryUsage: 156,
      status: "active",
    },
    {
      id: "sess_002",
      student: "Jane Smith",
      course: "CS102",
      language: "JavaScript",
      duration: "12m 45s",
      cpuUsage: 8,
      memoryUsage: 89,
      status: "idle",
    },
    {
      id: "sess_003",
      student: "Mike Johnson",
      course: "CS201",
      language: "Java",
      duration: "2m 15s",
      cpuUsage: 67,
      memoryUsage: 234,
      status: "building",
    },
    {
      id: "sess_004",
      student: "Sarah Wilson",
      course: "CS101",
      language: "C++",
      duration: "28m 12s",
      cpuUsage: 15,
      memoryUsage: 123,
      status: "active",
    },
    {
      id: "sess_005",
      student: "David Brown",
      course: "CS103",
      language: "Go",
      duration: "7m 33s",
      cpuUsage: 3,
      memoryUsage: 67,
      status: "idle",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "idle":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Idle</Badge>
      case "building":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Building</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader><CardTitle></CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Student</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Course</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Language</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Duration</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">CPU</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Memory</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{session.student}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{session.course}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{session.language}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{session.duration}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{session.cpuUsage}%</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{session.memoryUsage}MB</td>
                  <td className="py-3 px-3">{getStatusBadge(session.status)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                        <StopCircle className="h-3 w-3" />
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
  )
}
