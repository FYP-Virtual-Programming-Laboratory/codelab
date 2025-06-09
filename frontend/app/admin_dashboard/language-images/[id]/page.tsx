"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Layers, FileText, Wrench, Calendar, Copy, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LanguageImageDetail {
  id: string
  name: string
  version: string
  status: "Ready" | "Building" | "Failed" | "Scheduled for Deletion"
  created: string
  createdBy: "admin" | "default"
  adminId?: string
  baseImage: string
  fileExtension: string
  requiresCompilation: boolean
  executionCommand: string
  description: string
  buildLogs: Array<{
    timestamp: string
    message: string
  }>
}

// Mock data function
function getLanguageImageDetail(id: string): LanguageImageDetail | null {
  const images: Record<string, LanguageImageDetail> = {
    "1": {
      id: "1",
      name: "Python",
      version: "3.9",
      status: "Ready",
      created: "2023-10-15 14:30:22",
      createdBy: "default",
      baseImage: "python:3.9-slim",
      fileExtension: ".py",
      requiresCompilation: false,
      executionCommand: "python {filename}",
      description: "Python 3.9 language image for running Python code in a sandbox environment.",
      buildLogs: [
        { timestamp: "2023-10-15 14:28:10", message: "Starting build process" },
        { timestamp: "2023-10-15 14:28:45", message: "Pulling base image python:3.9-slim" },
        { timestamp: "2023-10-15 14:29:30", message: "Setting up environment" },
        { timestamp: "2023-10-15 14:30:15", message: "Build completed successfully" },
      ],
    },
    "2": {
      id: "2",
      name: "JavaScript",
      version: "ES2021",
      status: "Ready",
      created: "2023-10-10 09:15:33",
      createdBy: "admin",
      adminId: "current-admin",
      baseImage: "node:18-alpine",
      fileExtension: ".js",
      requiresCompilation: false,
      executionCommand: "node {filename}",
      description: "JavaScript ES2021 runtime environment with Node.js 18 for executing modern JavaScript code.",
      buildLogs: [
        { timestamp: "2023-10-10 09:12:20", message: "Starting build process" },
        { timestamp: "2023-10-10 09:13:05", message: "Pulling base image node:18-alpine" },
        { timestamp: "2023-10-10 09:14:10", message: "Installing dependencies" },
        { timestamp: "2023-10-10 09:15:30", message: "Build completed successfully" },
      ],
    },
    "3": {
      id: "3",
      name: "Java",
      version: "17",
      status: "Building",
      created: "2023-10-18 11:45:12",
      createdBy: "admin",
      adminId: "current-admin",
      baseImage: "openjdk:17-jdk-slim",
      fileExtension: ".java",
      requiresCompilation: true,
      executionCommand: "javac {filename} && java {classname}",
      description: "Java 17 development environment with OpenJDK for compiling and running Java applications.",
      buildLogs: [
        { timestamp: "2023-10-18 11:45:15", message: "Starting build process" },
        { timestamp: "2023-10-18 11:46:20", message: "Pulling base image openjdk:17-jdk-slim" },
        { timestamp: "2023-10-18 11:47:45", message: "Installing build tools" },
        { timestamp: "2023-10-18 11:48:30", message: "Configuring environment..." },
      ],
    },
    "4": {
      id: "4",
      name: "Ruby",
      version: "3.1",
      status: "Failed",
      created: "2023-10-12 16:22:18",
      createdBy: "admin",
      adminId: "other-admin",
      baseImage: "ruby:3.1-alpine",
      fileExtension: ".rb",
      requiresCompilation: false,
      executionCommand: "ruby {filename}",
      description: "Ruby 3.1 runtime environment for executing Ruby scripts and applications.",
      buildLogs: [
        { timestamp: "2023-10-12 16:22:20", message: "Starting build process" },
        { timestamp: "2023-10-12 16:23:15", message: "Pulling base image ruby:3.1-alpine" },
        { timestamp: "2023-10-12 16:24:30", message: "Installing gems" },
        { timestamp: "2023-10-12 16:25:45", message: "Error: Failed to install required dependencies" },
        { timestamp: "2023-10-12 16:25:46", message: "Build failed" },
      ],
    },
    "5": {
      id: "5",
      name: "Go",
      version: "1.18",
      status: "Scheduled for Deletion",
      created: "2023-10-05 13:10:55",
      createdBy: "admin",
      adminId: "current-admin",
      baseImage: "golang:1.18-alpine",
      fileExtension: ".go",
      requiresCompilation: true,
      executionCommand: "go run {filename}",
      description: "Go 1.18 development environment for building and running Go applications.",
      buildLogs: [
        { timestamp: "2023-10-05 13:11:00", message: "Starting build process" },
        { timestamp: "2023-10-05 13:11:30", message: "Pulling base image golang:1.18-alpine" },
        { timestamp: "2023-10-05 13:12:15", message: "Setting up Go workspace" },
        { timestamp: "2023-10-05 13:13:00", message: "Build completed successfully" },
      ],
    },
  }

  return images[id] || null
}

const statusConfig = {
  Ready: { color: "bg-green-100 text-green-800" },
  Building: { color: "bg-blue-100 text-blue-800" },
  Failed: { color: "bg-red-100 text-red-800" },
  "Scheduled for Deletion": { color: "bg-orange-100 text-orange-800" },
}

export default function LanguageImageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [image] = useState<LanguageImageDetail | null>(() => getLanguageImageDetail(params.id as string))

  if (!image) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Image Not Found</h2>
          <p className="text-gray-600 mb-4">The requested language image could not be found.</p>
          <Button onClick={() => router.push("/language-images")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Language Images
          </Button>
        </div>
      </div>
    )
  }

  const canEdit = () => {
    return image.createdBy === "admin" && image.adminId === "current-admin"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <Header title="Image Details" description="View and manage language image configuration and build information." />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.push("/language-images")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Language Images
          </Button>

          {/* Image Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-mono text-blue-600">{`</>`}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {image.name} {image.version}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge className={cn("text-xs", statusConfig[image.status].color)}>{image.status}</Badge>
                  </div>
                </div>
              </div>

              {canEdit() && (
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">Update</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Base Image</p>
                    <p className="text-sm text-gray-600 font-mono">{image.baseImage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">File Extension</p>
                    <p className="text-sm text-gray-600 font-mono">{image.fileExtension}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requires Compilation</p>
                    <p className="text-sm text-gray-600">{image.requiresCompilation ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">{image.created}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Execution Command */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Command</h2>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-gray-800">{image.executionCommand}</code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(image.executionCommand)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{image.description}</p>
          </div>

          {/* Build Logs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Build Logs</h2>
            <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {image.buildLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    <span className="text-gray-400">[{log.timestamp}]</span>
                    <span className="text-green-400 ml-2">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit() && (
            <div className="flex gap-3">
              <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                Prune Image
              </Button>
              {image.status === "Failed" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Build
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
