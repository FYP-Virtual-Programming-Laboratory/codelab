import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CodeLab",
  description: "Manage your coding sessions and students",
    generator: 'v0.dev'
}

import ClientLayout from "./ClientLayout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'
