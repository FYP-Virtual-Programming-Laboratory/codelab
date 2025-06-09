import { Header } from "@/components/header"
import { GroupGradingContent } from "@/components/group-grading-content"
import { notFound } from "next/navigation"

interface GroupGradingPageProps {
  params: {
    id: string
    groupId: string
  }
}

// Mock data for group grading
const getGroupGradingData = (sessionId: string, groupId: string) => {
  const gradingData: Record<string, any> = {
    "1-group-1": {
      group: {
        id: "group-1",
        name: "Team Alpha",
        leader: "John Smith",
      },
      session: {
        id: "1",
        title: "Data Structures Lab Assignment",
        courseCode: "CSC301",
      },
      exercises: [
        {
          id: "1",
          title: "To-Do List Frontend",
          description: "Develop React frontend for To-Do application",
          totalScore: 100,
        },
        {
          id: "2",
          title: "Backend API Development",
          description: "Create PHP API for CRUD operations",
          totalScore: 100,
        },
        {
          id: "3",
          title: "Database Design",
          description: "Design MySQL database schema",
          totalScore: 100,
        },
      ],
      students: [
        {
          id: "1",
          name: "John Smith",
          email: "johnsmith@example.com",
          matricNumber: "CSC/2021/001",
          avatar: "JS",
          avatarColor: "bg-blue-500",
          role: "Team Leader",
          scores: [
            { exerciseId: "1", score: 85, contribution: 40 },
            { exerciseId: "2", score: 92, contribution: 35 },
            { exerciseId: "3", score: 78, contribution: 25 },
          ],
          totalScore: 85,
          overallContribution: 33.3,
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarahjohnson@example.com",
          matricNumber: "CSC/2021/045",
          avatar: "SJ",
          avatarColor: "bg-purple-500",
          role: "Frontend Developer",
          scores: [
            { exerciseId: "1", score: 88, contribution: 45 },
            { exerciseId: "2", score: 75, contribution: 20 },
            { exerciseId: "3", score: 82, contribution: 35 },
          ],
          totalScore: 82,
          overallContribution: 33.3,
        },
        {
          id: "3",
          name: "Mike Chen",
          email: "mikechen@example.com",
          matricNumber: "CSC/2021/078",
          avatar: "MC",
          avatarColor: "bg-green-500",
          role: "Backend Developer",
          scores: [
            { exerciseId: "1", score: 72, contribution: 15 },
            { exerciseId: "2", score: 95, contribution: 45 },
            { exerciseId: "3", score: 88, contribution: 40 },
          ],
          totalScore: 85,
          overallContribution: 33.4,
        },
      ],
      groupScore: 84,
      submittedAt: "February 15, 2025 at 16:45",
      lastUpdated: "February 15, 2025 at 18:30",
    },
  }

  return gradingData[`${sessionId}-${groupId}`]
}

export default function GroupGradingPage({ params }: GroupGradingPageProps) {
  const gradingData = getGroupGradingData(params.id, params.groupId)

  if (!gradingData) {
    notFound()
  }

  return (
    <>
      <Header
        title="Group Submission Review"
        description="Review and grade group submissions"
        breadcrumbs={[
          { label: "Sessions", href: "/sessions" },
          { label: `Session ${params.id}`, href: `/sessions/${params.id}` },
          { label: "Grading", href: `/sessions/${params.id}` },
          { label: gradingData.group.name, href: "#" },
        ]}
      />
      <div className="flex-1 overflow-y-auto">
        <GroupGradingContent data={gradingData} />
      </div>
    </>
  )
}
