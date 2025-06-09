"use client"

import { useState } from "react"
import { Code, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EnrolledStudentsSection } from "@/components/enrolled-students-section"

interface SessionDetailsContentProps {
  session: {
    title: string
    courseCode: string
    description: string[]
    createdOn: string
    status: string
    totalInvitations: number
    pendingInvitations: number
    isCollaborative: boolean
    enrolledStudents: Array<{
      id: string
      name: string
      email: string
      avatar: string
      avatarColor: string
      matricNumber: string
      groupId?: string
    }>
    groups?: Array<{
      id: string
      name: string
      leader: string
    }>
    id: string
  }
}

export function SessionDetailsContent({ session }: SessionDetailsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-800 to-pink-400 rounded-lg p-8 text-white relative overflow-hidden">
        <div className="flex items-start gap-6">
          <div className="bg-teal-700/30 backdrop-blur-sm rounded-xl p-4 flex-shrink-0">
            <Code className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              {session.title} - {session.courseCode}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <span>Created on {session.createdOn}</span>
              <span className="w-1 h-1 bg-white/60 rounded-full"></span>
              <span>{session.status}</span>
              {session.isCollaborative && (
                <>
                  <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                  <span>Collaborative</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {session.description.map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Statistics */}
        <div className="flex gap-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6">
              <div className="grid grid-cols-3 gap-0.5">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">{session.totalInvitations} total invitations</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6">
              <div className="relative">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2">
                  <div className="w-full h-0.5 bg-yellow-500 rounded-full transform rotate-45"></div>
                  <div className="w-full h-0.5 bg-yellow-500 rounded-full transform -rotate-45 -mt-0.5"></div>
                </div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {session.pendingInvitations} pending invitations
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Students Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Enrolled Students</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <EnrolledStudentsSection
          students={session.enrolledStudents}
          isCollaborative={session.isCollaborative}
          groups={session.groups}
          searchQuery={searchQuery}
          sessionId={session.id}
        />
      </div>
    </div>
  )
}
