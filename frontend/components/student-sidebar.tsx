"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap, User, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface StudentSidebarProps {
  studentEmail: string
  studentName?: string
  isOpen?: boolean
  onClose?: () => void
}

export function StudentSidebar({ studentEmail, studentName = "Student", isOpen = true, onClose }: StudentSidebarProps) {
  const pathname = usePathname()
  const initials = studentName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const navItems = [
    {
      name: "Available Sessions",
      href: `/student_dashboard/sessions?email=${encodeURIComponent(studentEmail)}`,
      icon: BookOpen,
    },
    {
      name: "My Grades",
      href: `/student_dashboard/grades?email=${encodeURIComponent(studentEmail)}`,
      icon: GraduationCap,
    },
    {
      name: "Profile",
      href: `/student_dashboard/profile?email=${encodeURIComponent(studentEmail)}`,
      icon: User,
    },
    {
      name: "Settings",
      href: `/student_dashboard/settings?email=${encodeURIComponent(studentEmail)}`,
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 w-[220px] h-screen bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <span className="text-lg font-semibold">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <Link href={`/student_dashboard/sessions?email=${encodeURIComponent(studentEmail)}`}>
            <div className="bg-blue-600 text-white rounded-lg h-12 flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-blue-700 transition-colors">
              STUDENT PORTAL
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full",
                pathname === item.href.split("?")[0] || pathname.startsWith(item.href.split("?")[0] + "/")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">{initials || "S"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{studentName}</p>
              <p className="text-xs text-gray-500 truncate">{studentEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
