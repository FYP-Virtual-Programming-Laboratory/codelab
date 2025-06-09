"use client"

import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <DynamicLayout>{children}</DynamicLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

function DynamicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
