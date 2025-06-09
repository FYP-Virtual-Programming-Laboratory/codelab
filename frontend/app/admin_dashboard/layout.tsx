"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Menu, LayoutDashboard, Users, User, Settings, Monitor, Activity } from "lucide-react" // Import Menu and icon components

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
      href: "/admin_dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "All sessions",
      href: "/admin_dashboard/sessions",
      icon: Monitor,
    },
    {
      name: "Language Images",
      href: "/admin_dashboard/language-images",
      icon: Monitor,
    },
    {
      name: "System Monitor",
      href: "/admin_dashboard/system-monitor",
      icon: Activity,
    },
    {
      name: "All students",
      href: "/admin_dashboard/students",
      icon: Users,
    },
    {
      name: "Profile",
      href: "/admin_dashboard/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/admin_dashboard/settings",
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
