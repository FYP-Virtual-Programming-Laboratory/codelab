import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { SessionCard } from "@/components/session-card"
import { Button } from "@/components/ui/button"
import { CreateSessionButton } from "@/components/create-session-button"

export default function Dashboard() {
  const stats = [
    { title: "Total sessions", value: "108", percentageChange: 3.4 },
    { title: "Active sessions", value: "6", percentageChange: 3.4 },
    { title: "Total students", value: "589", percentageChange: 3.4 },
    { title: "Submitted tasks", value: "5,028", percentageChange: 3.4 },
  ]

  const recentSessions = [
    {
      id: "1",
      title: "Data Structures Lab Assignment",
      courseCode: "CSC301",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "ONGOING",
      isCollaborative: true,
      participants: [{ initial: "D" }, { initial: "C" }, { initial: "A" }, { initial: "", additionalCount: 79 }],
      progress: { current: 45, total: 82 },
    },
    {
      id: "2",
      title: "Web Development Practical",
      courseCode: "CSC411",
      description: "Build a responsive web application using modern frameworks and best practices.",
      status: "ONGOING",
      isCollaborative: false,
      participants: [{ initial: "F" }, { initial: "A" }, { initial: "S" }, { initial: "", additionalCount: 77 }],
      progress: { current: 42, total: 80 },
    },
    {
      id: "3",
      title: "Algorithms Weekly Task",
      courseCode: "CSC502",
      description: "Solve complex algorithmic problems using dynamic programming and graph theory.",
      status: "COMPLETED",
      isCollaborative: false,
      participants: [{ initial: "H" }, { initial: "R" }, { initial: "C" }, { initial: "", additionalCount: 99 }],
      progress: { current: 128, total: 128 },
      completedDate: "May 15, 2024",
      averageScore: 87,
    },
    {
      id: "4",
      title: "Full-Stack E-commerce Application",
      courseCode: "CSC412",
      description: "Collaborative development of a complete e-commerce platform with modern web technologies.",
      status: "COMPLETED",
      isCollaborative: true,
      participants: [{ initial: "A" }, { initial: "B" }, { initial: "C" }, { initial: "D" }],
      progress: { current: 102, total: 102 },
      completedDate: "June 2, 2024",
      averageScore: 92,
    },
    {
      id: "5",
      title: "Database Design Assignment",
      courseCode: "CSC301",
      description: "Design and implement a normalized database schema for a business application.",
      status: "CANCELLED",
      isCollaborative: false,
      participants: [{ initial: "H" }, { initial: "R" }, { initial: "C" }, { initial: "", additionalCount: 99 }],
      progress: { current: 54, total: 128 },
    },
    {
      id: "6",
      title: "AI Project Proposal",
      courseCode: "CSC501",
      description: "Research and propose an innovative AI solution for real-world problems.",
      status: "COMPLETED",
      isCollaborative: true,
      participants: [{ initial: "M" }, { initial: "D" }, { initial: "S" }, { initial: "", additionalCount: 99 }],
      progress: { current: 102, total: 102 },
      completedDate: "April 28, 2024",
      averageScore: 78,
    },
    {
      id: "7",
      title: "Cybersecurity Quiz",
      courseCode: "CSC503",
      description: "Comprehensive assessment of cybersecurity principles and best practices.",
      status: "COMPLETED",
      isCollaborative: false,
      participants: [{ initial: "D" }, { initial: "C" }, { initial: "A" }, { initial: "", additionalCount: 79 }],
      progress: { current: 82, total: 82 },
      completedDate: "May 22, 2024",
      averageScore: 85,
    },
  ]

  return (
    <>
      <Header 
        title="Dashboard" 
        description="Welcome, let's manage your sessions."
      >
        <CreateSessionButton />
      </Header>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                percentageChange={stat.percentageChange}
              />
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 p-4">
              <h2 className="text-xl font-semibold">Recent sessions</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-9 bg-white">
                  Status: All
                </Button>
                <Button variant="outline" className="h-9 bg-white">
                  Filter
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSessions.map((session, index) => (
                <SessionCard
                  key={index}
                  id={session.id}
                  title={session.title}
                  courseCode={session.courseCode}
                  description={session.description}
                  status={session.status as "ONGOING" | "COMPLETED" | "CANCELLED"}
                  isCollaborative={session.isCollaborative}
                  participants={session.participants}
                  progress={session.progress}
                  completedDate={session.completedDate}
                  averageScore={session.averageScore}
                  isAdmin={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
