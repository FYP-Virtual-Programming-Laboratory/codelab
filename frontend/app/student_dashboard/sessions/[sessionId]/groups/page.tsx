"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Users, UserPlus, Crown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { CreateGroupModal } from "@/components/create-group-modal"
import { Header } from "@/components/header"

// Mock data for sessions - expanded to include all collaborative sessions
const sessionData: Record<string, any> = {
  "1": {
    title: "Data Structures Lab Assignment",
    courseCode: "CSC301",
    status: "ONGOING",
    maxGroupSize: 4,
  },
  "3": {
    title: "Database Design Workshop",
    courseCode: "CSC315",
    status: "ONGOING",
    maxGroupSize: 3,
  },
  "4": {
    title: "Mobile App Development",
    courseCode: "CSC412",
    status: "OPEN",
    maxGroupSize: 5,
  },
  "6": {
    title: "Machine Learning Fundamentals",
    courseCode: "CSC550",
    status: "ONGOING",
    maxGroupSize: 4,
  },
}

// Mock data for groups - expanded to include all collaborative sessions
const groupsData: Record<string, any[]> = {
  "1": [
    {
      id: "group-1",
      name: "Team Alpha",
      leader: "John Smith",
      members: [
        {
          id: "1",
          name: "John Smith",
          matricNumber: "CSC/2021/001",
          avatar: "JS",
          color: "bg-blue-500",
          isLeader: true,
        },
        {
          id: "2",
          name: "Sarah Johnson",
          matricNumber: "CSC/2021/045",
          avatar: "SJ",
          color: "bg-purple-500",
          isLeader: false,
        },
        {
          id: "3",
          name: "Mike Chen",
          matricNumber: "CSC/2021/078",
          avatar: "MC",
          color: "bg-green-500",
          isLeader: false,
        },
      ],
      maxSize: 4,
    },
    {
      id: "group-2",
      name: "Code Warriors",
      leader: "Emily Davis",
      members: [
        {
          id: "4",
          name: "Emily Davis",
          matricNumber: "CSC/2021/023",
          avatar: "ED",
          color: "bg-pink-500",
          isLeader: true,
        },
        {
          id: "5",
          name: "David Wilson",
          matricNumber: "CSC/2021/067",
          avatar: "DW",
          color: "bg-orange-500",
          isLeader: false,
        },
      ],
      maxSize: 4,
    },
    {
      id: "group-3",
      name: "Debug Squad",
      leader: "Alex Rodriguez",
      members: [
        {
          id: "6",
          name: "Alex Rodriguez",
          matricNumber: "CSC/2021/089",
          avatar: "AR",
          color: "bg-red-500",
          isLeader: true,
        },
        {
          id: "7",
          name: "Lisa Wang",
          matricNumber: "CSC/2021/034",
          avatar: "LW",
          color: "bg-teal-500",
          isLeader: false,
        },
        {
          id: "8",
          name: "Tom Brown",
          matricNumber: "CSC/2021/056",
          avatar: "TB",
          color: "bg-indigo-500",
          isLeader: false,
        },
        {
          id: "9",
          name: "Anna Lee",
          matricNumber: "CSC/2021/012",
          avatar: "AL",
          color: "bg-yellow-500",
          isLeader: false,
        },
      ],
      maxSize: 4,
    },
    {
      id: "group-4",
      name: "Binary Builders",
      leader: "Chris Taylor",
      members: [
        {
          id: "10",
          name: "Chris Taylor",
          matricNumber: "CSC/2021/098",
          avatar: "CT",
          color: "bg-cyan-500",
          isLeader: true,
        },
      ],
      maxSize: 4,
    },
  ],
  "3": [
    {
      id: "group-db-1",
      name: "SQL Masters",
      leader: "Rachel Green",
      members: [
        {
          id: "11",
          name: "Rachel Green",
          matricNumber: "CSC/2021/076",
          avatar: "RG",
          color: "bg-emerald-500",
          isLeader: true,
        },
        {
          id: "12",
          name: "Kevin Park",
          matricNumber: "CSC/2021/043",
          avatar: "KP",
          color: "bg-violet-500",
          isLeader: false,
        },
      ],
      maxSize: 3,
    },
    {
      id: "group-db-2",
      name: "Data Wizards",
      leader: "Sophie Miller",
      members: [
        {
          id: "13",
          name: "Sophie Miller",
          matricNumber: "CSC/2021/087",
          avatar: "SM",
          color: "bg-rose-500",
          isLeader: true,
        },
        {
          id: "14",
          name: "James Wilson",
          matricNumber: "CSC/2021/065",
          avatar: "JW",
          color: "bg-amber-500",
          isLeader: false,
        },
        {
          id: "15",
          name: "Maya Patel",
          matricNumber: "CSC/2021/021",
          avatar: "MP",
          color: "bg-lime-500",
          isLeader: false,
        },
      ],
      maxSize: 3,
    },
    {
      id: "group-db-3",
      name: "Query Experts",
      leader: "Robert Chen",
      members: [
        {
          id: "16",
          name: "Robert Chen",
          matricNumber: "CSC/2021/099",
          avatar: "RC",
          color: "bg-blue-600",
          isLeader: true,
        },
      ],
      maxSize: 3,
    },
  ],
  "4": [
    {
      id: "group-mobile-1",
      name: "Mobile Innovators",
      leader: "Daniel Kim",
      members: [
        {
          id: "17",
          name: "Daniel Kim",
          matricNumber: "CSC/2021/054",
          avatar: "DK",
          color: "bg-sky-500",
          isLeader: true,
        },
        {
          id: "18",
          name: "Olivia Chen",
          matricNumber: "CSC/2021/032",
          avatar: "OC",
          color: "bg-fuchsia-500",
          isLeader: false,
        },
        {
          id: "19",
          name: "Marcus Johnson",
          matricNumber: "CSC/2021/091",
          avatar: "MJ",
          color: "bg-slate-500",
          isLeader: false,
        },
      ],
      maxSize: 5,
    },
    {
      id: "group-mobile-2",
      name: "App Creators",
      leader: "Jessica Wong",
      members: [
        {
          id: "20",
          name: "Jessica Wong",
          matricNumber: "CSC/2021/102",
          avatar: "JW",
          color: "bg-purple-600",
          isLeader: true,
        },
        {
          id: "21",
          name: "Ryan Foster",
          matricNumber: "CSC/2021/073",
          avatar: "RF",
          color: "bg-neutral-500",
          isLeader: false,
        },
      ],
      maxSize: 5,
    },
  ],
  "6": [
    {
      id: "group-ml-1",
      name: "AI Enthusiasts",
      leader: "Zoe Adams",
      members: [
        {
          id: "22",
          name: "Zoe Adams",
          matricNumber: "CSC/2021/018",
          avatar: "ZA",
          color: "bg-stone-500",
          isLeader: true,
        },
        {
          id: "23",
          name: "Lucas Brown",
          matricNumber: "CSC/2021/108",
          avatar: "LB",
          color: "bg-indigo-500",
          isLeader: false,
        },
        {
          id: "24",
          name: "Emma Wilson",
          matricNumber: "CSC/2021/107",
          avatar: "EW",
          color: "bg-pink-500",
          isLeader: false,
        },
      ],
      maxSize: 4,
    },
    {
      id: "group-ml-2",
      name: "Neural Network Team",
      leader: "Alex Martinez",
      members: [
        {
          id: "25",
          name: "Alex Martinez",
          matricNumber: "CSC/2021/104",
          avatar: "AM",
          color: "bg-red-500",
          isLeader: true,
        },
        {
          id: "26",
          name: "Sarah Thompson",
          matricNumber: "CSC/2021/105",
          avatar: "ST",
          color: "bg-orange-500",
          isLeader: false,
        },
      ],
      maxSize: 4,
    },
    {
      id: "group-ml-3",
      name: "Deep Learning Squad",
      leader: "Michael Zhang",
      members: [
        {
          id: "27",
          name: "Michael Zhang",
          matricNumber: "CSC/2021/110",
          avatar: "MZ",
          color: "bg-green-600",
          isLeader: true,
        },
      ],
      maxSize: 4,
    },
  ],
}

export default function GroupSelectionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const email = searchParams.get("email") || ""
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [studentName, setStudentName] = useState("Student User") // Add this state

  useEffect(() => {
    // Add this effect
    if (email) {
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      setStudentName(name)
    }
  }, [email])

  const session = sessionData[sessionId]
  const groups = groupsData[sessionId] || []

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.members.some(
        (member: any) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  )

  const handleJoinGroup = (groupId: string) => {
    // In a real app, you would join the group via API
    router.push(`/student_dashboard/sessions/${sessionId}`)
  }

  const handleCreateGroup = (groupData: any) => {
    // In a real app, you would create the group via API
    console.log("Creating group:", groupData)
    setShowCreateModal(false)
    // Redirect to the session detail page
    router.push(
      `/student_dashboard/sessions/${sessionId}`,
    )
  }

  if (!session) {
    return <div>Session not found</div>
  }


  return (
    <>
      <Header 
        title="Join collaborative session"
        description="Join a group or create a new one to join a collaborative session"
      />
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <p className="text-white/80">Select or create a group to join this collaborative session</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-none">{session.courseCode}</Badge>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-white text-sm">{email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto">
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-4 overflow-auto">
              {/* Search and create group */}
              <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search groups or members..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-teal-800 hover:bg-teal-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </div>

              {/* Groups grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="overflow-hidden border border-gray-200 bg-white">
                    <CardHeader className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                        <Badge className="bg-white/20 text-white border-none">
                          {group.members.length}/{group.maxSize}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-white/80">
                        <Crown className="h-3.5 w-3.5 mr-1" />
                        <span>Led by {group.leader}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Group Members</h4>
                        {group.members.map((member: any) => (
                          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${member.color} text-white text-xs`}>
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                {member.isLeader && <Crown className="h-3 w-3 text-yellow-500" />}
                              </div>
                              <p className="text-xs text-gray-500">{member.matricNumber}</p>
                            </div>
                          </div>
                        ))}

                        {/* Show empty slots */}
                        {Array.from({ length: group.maxSize - group.members.length }).map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="flex items-center gap-3 p-2 rounded-lg border-2 border-dashed border-gray-200"
                          >
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserPlus className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-400">Available slot</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.members.length >= group.maxSize}
                          className={`w-full ${
                            group.members.length >= group.maxSize
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-teal-800 hover:bg-teal-700 text-white"
                          }`}
                        >
                          {group.members.length >= group.maxSize ? (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Group Full
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Join Group
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredGroups.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or create a new group</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-teal-800 hover:bg-teal-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateGroup={handleCreateGroup}
        session={session}
        userEmail={email}
      />
    </>
  )
}
