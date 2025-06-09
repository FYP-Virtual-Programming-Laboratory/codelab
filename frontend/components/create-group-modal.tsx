"use client"

import type React from "react"

import { useState } from "react"
import { X, Users, Crown, Hash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateGroup: (groupData: any) => void
  session: {
    title: string
    courseCode: string
    maxGroupSize: number
  }
  userEmail: string
}

export function CreateGroupModal({ open, onOpenChange, onCreateGroup, session, userEmail }: CreateGroupModalProps) {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
  })

  // Generate user info from email
  const userName = userEmail
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
  const userMatricNumber = `CSC/2021/${Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0")}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupData.name.trim()) return

    const finalGroupData = {
      ...groupData,
      createdBy: userEmail,
      sessionId: session.courseCode,
    }

    onCreateGroup(finalGroupData)

    // Reset form
    setGroupData({
      name: "",
      description: "",
    })
  }

  const handleCancel = () => {
    setGroupData({
      name: "",
      description: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Create New Group</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Session Info */}
          <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-white/80">{session.courseCode}</p>
              </div>
              <Badge className="bg-white/20 text-white border-none">
                <Users className="h-3 w-3 mr-1" />
                Max {session.maxGroupSize} members
              </Badge>
            </div>
          </div>

          {/* Group Leader (You) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Group Leader</Label>
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-500 text-white font-medium">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <Crown className="h-4 w-4 text-amber-500" />
                  <Badge variant="outline" className="text-xs">
                    Leader
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{userEmail}</p>
                <p className="text-xs text-gray-500">{userMatricNumber}</p>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-medium">
              Group Name *
            </Label>
            <Input
              id="group-name"
              placeholder="Enter a creative group name (e.g., Code Ninjas, Debug Squad)"
              value={groupData.name}
              onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
              required
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description" className="text-sm font-medium">
              Group Description (Optional)
            </Label>
            <Textarea
              id="group-description"
              placeholder="Describe your group's goals, working style, or any specific requirements..."
              rows={3}
              value={groupData.description}
              onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
            />
          </div>

          {/* Group Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Group Preview</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{groupData.name || "Your Group Name"}</span>
              </div>
              {groupData.description && <p className="text-sm text-gray-600 ml-6">{groupData.description}</p>}
              <div className="flex items-center gap-2 ml-6">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">1 / {session.maxGroupSize} members</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-800 hover:bg-teal-700 text-white"
              disabled={!groupData.name.trim()}
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
