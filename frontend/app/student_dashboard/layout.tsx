"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Menu, LayoutDashboard, User, Settings, BookOpen, GraduationCap } from "lucide-react" // Import Menu and icon components

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

const navItems = [
    {
      name: "Dashboard",
      href: `/student_dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Available Sessions",
      href: `/student_dashboard/sessions`,
      icon: BookOpen,
    },
    {
      name: "My Grades",
      href: `/student_dashboard/grades`,
      icon: GraduationCap,
    },
    {
      name: "Profile",
      href: `/student_dashboard/profile`,
      icon: User,
    },
    {
      name: "Settings",
      href: `/student_dashboard/settings`,
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
