import { CreateSessionButton } from "@/components/create-session-button"
import { Header } from "@/components/header"
import { SessionCard } from "@/components/session-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function SessionsPage() {
  const sessions = [
    {
      id: "1",
      title: "Data Structures Lab Assignment",
      courseCode: "CSC301",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "ONGOING" as const,
      isCollaborative: true,
      participants: [{ initial: "D" }, { initial: "C" }, { initial: "A" }, { initial: "", additionalCount: 79 }],
      progress: { current: 45, total: 82 },
    },
    {
      id: "2",
      title: "Web Development Practical",
      courseCode: "CSC411",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "ONGOING" as const,
      isCollaborative: false,
      participants: [{ initial: "F" }, { initial: "A" }, { initial: "S" }, { initial: "", additionalCount: 77 }],
      progress: { current: 42, total: 80 },
    },
    {
      id: "3",
      title: "Algorithms Weekly Task",
      courseCode: "CSC502",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "COMPLETED" as const,
      isCollaborative: false,
      participants: [{ initial: "H" }, { initial: "R" }, { initial: "C" }, { initial: "", additionalCount: 99 }],
      progress: { current: 54, total: 128 },
      completedDate: "May 15, 2023",
      averageScore: 87,
    },
    {
      id: "4",
      title: "Mobile App Development Workshop",
      courseCode: "CSC412",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "COMPLETED" as const,
      isCollaborative: true,
      participants: [{ initial: "M" }, { initial: "D" }, { initial: "S" }, { initial: "", additionalCount: 99 }],
      progress: { current: 61, total: 102 },
      completedDate: "June 2, 2023",
      averageScore: 92,
    },
    {
      id: "5",
      title: "Database Design Assignment",
      courseCode: "CSC301",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "CANCELLED" as const,
      isCollaborative: false,
      participants: [{ initial: "H" }, { initial: "R" }, { initial: "C" }, { initial: "", additionalCount: 99 }],
      progress: { current: 54, total: 128 },
    },
    {
      id: "6",
      title: "AI Project Proposal",
      courseCode: "CSC501",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "COMPLETED" as const,
      isCollaborative: true,
      participants: [{ initial: "M" }, { initial: "D" }, { initial: "S" }, { initial: "", additionalCount: 99 }],
      progress: { current: 61, total: 102 },
      completedDate: "April 28, 2023",
      averageScore: 78,
    },
    {
      id: "7",
      title: "Cybersecurity Quiz",
      courseCode: "",
      description: "Implement linked lists and perform basic operations such as insertion, deletion, and traversal.",
      status: "COMPLETED" as const,
      isCollaborative: false,
      participants: [{ initial: "D" }, { initial: "C" }, { initial: "A" }, { initial: "", additionalCount: 79 }],
      progress: { current: 45, total: 82 },
      completedDate: "May 22, 2023",
      averageScore: 85,
    },
  ]

  return (
    <>
      <Header 
        title="All sessions" 
        description="Manage all your created sessions here." 
      >
        <CreateSessionButton />
      </Header>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <div className="bg-white border border-gray-200 p-4 flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for session..." className="pl-10" />
              </div>
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
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title}
                  courseCode={session.courseCode}
                  description={session.description}
                  status={session.status}
                  isCollaborative={session.isCollaborative}
                  participants={session.participants}
                  progress={session.progress}
                  completedDate={session.completedDate}
                  averageScore={session.averageScore}
                  isAdmin={true} // This is the admin sessions page
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
