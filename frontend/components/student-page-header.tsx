"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StudentPageHeaderProps {
  title: string
  description: string
  userEmail?: string
  showUserInfo?: boolean
}

export function StudentPageHeader({ title, description, userEmail, showUserInfo = false }: StudentPageHeaderProps) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "S"

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{title}</h1>
            <p className="text-blue-100">{description}</p>
          </div>
          {showUserInfo && userEmail && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userEmail}</p>
                <p className="text-xs text-blue-200">Student</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white border border-white/30">{initial}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
