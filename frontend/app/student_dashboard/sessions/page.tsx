"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Search, Filter, Calendar, Clock, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { SessionCardContent } from "@/components/session-card-content"
import { JoinSessionButton } from "@/components/join-session-button"
import { SessionStatus, SESSION_STATUS } from "@/lib/types"


// Mock data for available sessions
const availableSessions: {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  status: SessionStatus;
  isCollaborative: boolean;
  startDate: string;
  startTime: string;
  duration: string;
  instructor: string;
  instructorAvatar: string;
  instructorColor: string;
  languages: string[];
  participants: number;
  maxParticipants: number;
  isCompleted: boolean;
  completedDate?: string;
  score?: number;
}[] = [
  {
    id: "1",
    title: "Data Structures Lab Assignment",
    courseCode: "CSC301",
    description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
    status: "ONGOING",
    isCollaborative: true,
    startDate: "Feb 5, 2025",
    startTime: "12:00 PM",
    duration: "4 hours",
    instructor: "Dr. Rhoda Ogunesan",
    instructorAvatar: "RO",
    instructorColor: "bg-amber-500",
    languages: ["Python", "C++", "Java"],
    participants: 45,
    maxParticipants: 82,
    isCompleted: false,
  },
  {
    id: "2",
    title: "Web Development Practical",
    courseCode: "CSC411",
    description:
      "Build a responsive website using HTML, CSS, and JavaScript with modern frameworks and best practices.",
    status: "COMPLETED",
    isCollaborative: false,
    startDate: "Jan 28, 2025",
    startTime: "10:00 AM",
    duration: "3 hours",
    instructor: "Prof. Michael Chen",
    instructorAvatar: "MC",
    instructorColor: "bg-blue-500",
    languages: ["HTML", "CSS", "JavaScript", "React"],
    participants: 38,
    maxParticipants: 60,
    isCompleted: true,
    completedDate: "Jan 28, 2025",
    score: 85,
  },
  {
    id: "3",
    title: "Algorithms Weekly Task",
    courseCode: "CSC502",
    description: "Implement and analyze various sorting and searching algorithms with complexity analysis.",
    status: "ONGOING",
    isCollaborative: true,
    startDate: "Feb 12, 2025",
    startTime: "2:00 PM",
    duration: "5 hours",
    instructor: "Dr. Sarah Johnson",
    instructorAvatar: "SJ",
    instructorColor: "bg-purple-500",
    languages: ["Python", "Java", "C++"],
    participants: 32,
    maxParticipants: 50,
    isCompleted: false,
  },
  {
    id: "4",
    title: "Full-Stack E-commerce Application",
    courseCode: "CSC412",
    description:
      "Create a full-stack e-commerce application with user authentication, product catalog, and payment processing.",
    status: "COMPLETED",
    isCollaborative: true,
    startDate: "Jan 15, 2025",
    startTime: "9:00 AM",
    duration: "6 hours",
    instructor: "Prof. David Lee",
    instructorAvatar: "DL",
    instructorColor: "bg-green-500",
    languages: ["JavaScript", "React", "Node.js", "MongoDB"],
    participants: 28,
    maxParticipants: 40,
    isCompleted: true,
    completedDate: "Jan 15, 2025",
    score: 92,
  },
  {
    id: "5",
    title: "Database Design Workshop",
    courseCode: "CSC315",
    description:
      "Learn to design efficient database schemas, write complex queries, and optimize database performance.",
    status: "CANCELLED",
    isCollaborative: false,
    startDate: "Jan 25, 2025",
    startTime: "1:00 PM",
    duration: "3 hours",
    instructor: "Dr. Alex Martinez",
    instructorAvatar: "AM",
    instructorColor: "bg-red-500",
    languages: ["SQL", "MySQL", "PostgreSQL"],
    participants: 50,
    maxParticipants: 100,
    isCompleted: false,
  },
  {
    id: "6",
    title: "AI Project Proposal",
    courseCode: "CSC501",
    description: "Design and propose an artificial intelligence project with detailed implementation plan.",
    status: "COMPLETED",
    isCollaborative: true,
    startDate: "Feb 20, 2025",
    startTime: "11:00 AM",
    duration: "4 hours",
    instructor: "Prof. Emily Wong",
    instructorAvatar: "EW",
    instructorColor: "bg-pink-500",
    languages: ["Python", "TensorFlow", "PyTorch"],
    participants: 42,
    maxParticipants: 60,
    isCompleted: true,
    completedDate: "Feb 20, 2025",
    score: 78,
  },
  {
    id: "7",
    title: "Cybersecurity Quiz",
    courseCode: "CSC404",
    description: "Comprehensive assessment of cybersecurity principles and practical security measures.",
    status: "COMPLETED",
    isCollaborative: false,
    startDate: "Jan 20, 2025",
    startTime: "3:00 PM",
    duration: "2 hours",
    instructor: "Dr. James Wilson",
    instructorAvatar: "JW",
    instructorColor: "bg-orange-500",
    languages: ["C", "Python"],
    participants: 25,
    maxParticipants: 40,
    isCompleted: true,
    completedDate: "Jan 20, 2025",
    score: 78,
  },
  {
    id: "8",
    title: "Operating Systems Principles",
    courseCode: "CSC405",
    description: "Explore operating system concepts including process management, memory management, and file systems.",
    status: "OPEN",
    isCollaborative: false,
    startDate: "Feb 25, 2025",
    startTime: "11:30 AM",
    duration: "3 hours",
    instructor: "Prof. Lisa Thompson",
    instructorAvatar: "LT",
    instructorColor: "bg-cyan-500",
    languages: ["C", "Assembly"],
    participants: 30,
    maxParticipants: 45,
    isCompleted: false,
  },
]

export default function SessionsListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSessions, setFilteredSessions] = useState(availableSessions)

  useEffect(() => {
    if (searchQuery) {
      setFilteredSessions(
        availableSessions.filter(
          (session) =>
            session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredSessions(availableSessions)
    }
  }, [searchQuery])

  const getHeaderGradient = (status: SessionStatus) => {
    if (status === SESSION_STATUS.COMPLETED) {
      return "bg-gradient-to-r from-green-600 to-green-500"
    }
    return status === SESSION_STATUS.ONGOING
      ? "bg-gradient-to-r from-red-600 to-red-500"
      : "bg-gradient-to-r from-teal-800 to-emerald-700"
  }

  const getStatusBadgeColor = (status: SessionStatus) => {
    if (status === SESSION_STATUS.COMPLETED) {
      return "bg-green-100 text-green-700 border-green-200"
    }
    return status === SESSION_STATUS.ONGOING
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-white/20 hover:bg-white/30 text-white border-none"
  }

  const handleJoinSession = (session: any) => {
    if (session.isCompleted) {
      router.push(`/student_dashboard/session/${session.id}/grading`)
    } else if (session.isCollaborative) {
      router.push(`/student_dashboard/sessions/${session.id}/groups`)
    } else {
      router.push(`/student_dashboard/sessions/${session.id}`)
    }
  }

  return (
    <>
      <Header title="Available Sessions" description="Browse and join coding sessions"/>
      <div className="p-4 overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-200 p-5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for sessions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" className="bg-white">
              Sort by: Latest
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden border border-gray-200 bg-white">
              <div className={`${getHeaderGradient(session.status)} p-4 text-white`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <Badge className={getStatusBadgeColor(session.status)}>
                      {session.status === "COMPLETED" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {session.status}
                    </Badge>
                    {session.isCollaborative && !session.isCompleted && (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                        <Users className="h-3 w-3 mr-1" />
                        Collaborative
                      </Badge>
                    )}
                  </div>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{session.courseCode}</Badge>
                </div>
                <h2 className="text-xl font-bold mb-1">{session.title}</h2>
                <div className="flex items-center text-sm text-white/80">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{session.isCompleted ? `Completed: ${session.completedDate}` : session.startDate}</span>
                  {!session.isCompleted && (
                    <>
                      <span className="mx-2">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{session.startTime}</span>
                    </>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <SessionCardContent session={session} />
              </CardContent>

              <CardFooter className="bg-gray-50 p-4 border-t border-gray-100">
                <JoinSessionButton session={session} handleJoinSession={handleJoinSession} />
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  )
}
