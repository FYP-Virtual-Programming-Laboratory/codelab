import { RecentSessionsHeader } from "@/components/recent-sessions-header"
import { SessionsGrid } from "@/components/sessions-grid"

interface RecentSessionsProps {
  sessions: Array<{
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
  }>
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <div className="bg-white border border-gray-200 p-6">
      <RecentSessionsHeader />
      <SessionsGrid sessions={sessions} />
    </div>
  )
}
