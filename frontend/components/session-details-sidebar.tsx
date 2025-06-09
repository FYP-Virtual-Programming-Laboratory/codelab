"use client"

import { useState } from "react"
import { Clock, Calendar, Copy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface SessionDetailsSidebarProps {
  session: {
    invitationLink: string
    expiresOn: string
    duration: string
    sessionStarts: string
    sessionEnds: string
    supportedLanguages: string
    isCollaborative: boolean
    groups?: Array<{
      id: string
      name: string
      leader: string
    }>
  }
}

export function SessionDetailsSidebar({ session }: SessionDetailsSidebarProps) {
  const [invitationValidity, setInvitationValidity] = useState(true)
  const [openAccess, setOpenAccess] = useState(false)
  const [sessionOngoing, setSessionOngoing] = useState(true)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(session.invitationLink)
  }

  return (
    <div className="space-y-6">
      {/* Invitation Link Validity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Invitation link validity</Label>
          <Switch checked={invitationValidity} onCheckedChange={setInvitationValidity} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700 font-mono truncate flex-1 mr-2">{session.invitationLink}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-teal-600 hover:text-teal-700 flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Expires on {session.expiresOn}</p>
        </div>
      </div>

      {/* Collaboration Info */}
      {session.isCollaborative && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Collaborative Session
            </Label>
            <Badge className="bg-blue-100 text-blue-700">{session.groups?.length || 0} groups</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Setting</span>
            <span className="text-sm font-medium">Multiple work groups</span>
          </div>
        </div>
      )}

      {/* Open Access */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Open access</Label>
          <Switch checked={openAccess} onCheckedChange={setOpenAccess} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Setting</span>
          <span className="text-sm font-medium">
            {session.isCollaborative ? "Multiple work groups" : "Individual work"}
          </span>
        </div>
      </div>

      {/* Session Ongoing */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Session ongoing</Label>
          <Switch checked={sessionOngoing} onCheckedChange={setSessionOngoing} />
        </div>
      </div>

      {/* Session Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-sm font-medium">{session.duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Session starts</p>
            <p className="text-sm font-medium">{session.sessionStarts}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Session ends</p>
            <p className="text-sm font-medium">{session.sessionEnds}</p>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Supported languages</h3>
        <p className="text-sm text-gray-700">{session.supportedLanguages}</p>
      </div>

      {/* Edit Button */}
      <Button className="w-full bg-teal-800 hover:bg-teal-700 text-white">Edit session details</Button>
    </div>
  )
}
