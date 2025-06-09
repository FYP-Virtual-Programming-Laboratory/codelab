"use client"

import type React from "react"
import { useState } from "react"
import { Menu, BookOpen, GraduationCap, User, Settings } from "lucide-react" // Import icons
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar" // Import shared Sidebar component
// Remove import of StudentSidebar
// import { StudentSidebar } from "@/components/student-sidebar"

interface StudentLayoutProps {
  children: React.ReactNode
  studentEmail: string
  studentName?: string
  pageSpecificHeader?: React.ReactNode
}

export function StudentLayout({
  children,
  studentEmail,
  studentName = "Student",
  pageSpecificHeader,
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="flex bg-gray-100 h-screen">
      {/* Student Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
      />

      {/* Main content column (including fixed headers and scrollable content) */}
      <div className="flex-1 flex flex-col md:ml-[220px] max-h-screen">
        {" "}
        {/* Ensure this column manages overflow */}
        {/* Mobile-only Menu Button Header (very top, sticky) */}
        {/* This header has a height of roughly 4rem (h-16) due to p-4 */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Menu
          </Button>
        </header>
        {/* Page Specific Header */}
        {/* On mobile, this sticks below the mobile menu (top-16). On desktop, it sticks to the top (md:top-0). */}
        {pageSpecificHeader && (
          <div className="sticky top-16 md:top-0 z-40 bg-white border-b border-gray-200 shrink-0">
            {/* pageSpecificHeader content is rendered here. It should not have its own sticky/fixed usually. */}
            {/* The border-b is added here to ensure a consistent look if the passed header doesn't have one. */}
            {pageSpecificHeader}
          </div>
        )}
        {/* Scrollable Page Content */}
        <main className="flex-grow overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
