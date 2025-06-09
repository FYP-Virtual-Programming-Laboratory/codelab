import { SessionCard } from "@/components/session-card"

interface SessionData {
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
}

interface SessionsGridProps {
  sessions: SessionData[]
  className?: string
  isAdmin?: boolean
}

export function SessionsGrid({ sessions, className, isAdmin = false }: SessionsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ""}`}>
      {sessions.map((session, index) => (
        <SessionCard
          key={session.id || index}
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
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
