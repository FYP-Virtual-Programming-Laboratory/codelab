import { Crown, Users, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface GroupInfoCardProps {
  group: {
    name: string
    members: Array<{
      id: string
      name: string
      matricNumber: string
      avatar: string
      color: string
      isLeader: boolean
      status: "online" | "away" | "offline"
    }>
  }
}

export function GroupInfoCard({ group }: GroupInfoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "away":
        return "text-yellow-500"
      case "offline":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Away"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {group.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${member.color} text-white text-xs`}>{member.avatar}</AvatarFallback>
                </Avatar>
                <Circle
                  className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(member.status)} fill-current`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  {member.isLeader && <Crown className="h-3 w-3 text-yellow-500" />}
                </div>
                <p className="text-xs text-gray-500">{member.matricNumber}</p>
                <p className="text-xs text-gray-400">{getStatusText(member.status)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Group Members</span>
            <Badge variant="outline">{group.members.length} members</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
