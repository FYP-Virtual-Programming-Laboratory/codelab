"use client"

import { useState } from "react"
import { MoreHorizontal, Users, Crown, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Student {
  id: string
  name: string
  email: string
  avatar: string
  avatarColor: string
  matricNumber: string
  groupId?: string
}

interface Group {
  id: string
  name: string
  leader: string
}

interface EnrolledStudentsSectionProps {
  students: Student[]
  isCollaborative: boolean
  groups?: Group[]
  searchQuery: string
}

export function EnrolledStudentsSection({
  students,
  isCollaborative,
  groups = [],
  searchQuery,
}: EnrolledStudentsSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    groups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {}),
  )

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">No students found</h3>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
      </div>
    )
  }

  if (!isCollaborative) {
    // For non-collaborative sessions, show a simple list
    return (
      <div className="p-6">
        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-3">
            <div className="col-span-4">Student name</div>
            <div className="col-span-4">Email address</div>
            <div className="col-span-3">Matric number</div>
            <div className="col-span-1"></div>
          </div>

          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="col-span-4 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${student.avatarColor} text-white text-sm font-medium`}>
                    {student.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="col-span-4 text-gray-600">{student.email}</div>
              <div className="col-span-3 text-gray-600">{student.matricNumber}</div>
              <div className="col-span-1 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // For collaborative sessions, group students by their teams
  const studentsByGroup: Record<string, Student[]> = {}
  const ungroupedStudents: Student[] = []

  // Group students by their teams
  filteredStudents.forEach((student) => {
    if (student.groupId) {
      if (!studentsByGroup[student.groupId]) {
        studentsByGroup[student.groupId] = []
      }
      studentsByGroup[student.groupId].push(student)
    } else {
      ungroupedStudents.push(student)
    }
  })

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Grouped students */}
        {groups.map((group) => {
          const groupStudents = studentsByGroup[group.id] || []
          if (groupStudents.length === 0 && searchQuery) return null // Hide empty groups when searching

          return (
            <Collapsible
              key={group.id}
              open={expandedGroups[group.id]}
              onOpenChange={() => toggleGroup(group.id)}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <div className="bg-blue-50 p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {group.name}
                        <Badge className="bg-blue-100 text-blue-700 ml-2">{groupStudents.length} students</Badge>
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Crown className="h-3 w-3 text-amber-500" />
                        Group Leader: {group.leader}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {expandedGroups[group.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4">
                  {groupStudents.length > 0 ? (
                    <div className="space-y-1">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-3">
                        <div className="col-span-4">Student name</div>
                        <div className="col-span-4">Email address</div>
                        <div className="col-span-3">Matric number</div>
                        <div className="col-span-1"></div>
                      </div>

                      {groupStudents.map((student) => (
                        <div
                          key={student.id}
                          className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="col-span-4 flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${student.avatarColor} text-white text-sm font-medium`}>
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {student.name}
                              {group.leader === student.name && (
                                <Crown className="h-3 w-3 text-amber-500 inline ml-2" />
                              )}
                            </span>
                          </div>
                          <div className="col-span-4 text-gray-600">{student.email}</div>
                          <div className="col-span-3 text-gray-600">{student.matricNumber}</div>
                          <div className="col-span-1 flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No students in this group</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {/* Ungrouped students */}
        {ungroupedStudents.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                Ungrouped Students
                <Badge variant="outline" className="ml-2">
                  {ungroupedStudents.length} students
                </Badge>
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-3">
                  <div className="col-span-4">Student name</div>
                  <div className="col-span-4">Email address</div>
                  <div className="col-span-3">Matric number</div>
                  <div className="col-span-1"></div>
                </div>

                {ungroupedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${student.avatarColor} text-white text-sm font-medium`}>
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="col-span-4 text-gray-600">{student.email}</div>
                    <div className="col-span-3 text-gray-600">{student.matricNumber}</div>
                    <div className="col-span-1 flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
