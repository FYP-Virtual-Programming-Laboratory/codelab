"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, RotateCcw, Clock, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { CreateImageModal } from "@/components/create-image-modal"

interface LanguageImage {
  id: string
  name: string
  version: string
  status: "Ready" | "Building" | "Failed" | "Scheduled for Deletion"
  created: string
  createdBy: "admin" | "default"
  adminId?: string
}

// Mock data
function getLanguageImages(): LanguageImage[] {
  return [
    {
      id: "1",
      name: "Python",
      version: "3.9",
      status: "Ready",
      created: "2023-10-15",
      createdBy: "default",
    },
    {
      id: "2",
      name: "JavaScript",
      version: "ES2021",
      status: "Ready",
      created: "2023-10-10",
      createdBy: "admin",
      adminId: "current-admin",
    },
    {
      id: "3",
      name: "Java",
      version: "17",
      status: "Building",
      created: "2023-10-18",
      createdBy: "admin",
      adminId: "current-admin",
    },
    {
      id: "4",
      name: "Ruby",
      version: "3.1",
      status: "Failed",
      created: "2023-10-12",
      createdBy: "admin",
      adminId: "other-admin",
    },
    {
      id: "5",
      name: "Go",
      version: "1.18",
      status: "Scheduled for Deletion",
      created: "2023-10-05",
      createdBy: "admin",
      adminId: "current-admin",
    },
    {
      id: "6",
      name: "C++",
      version: "20",
      status: "Ready",
      created: "2023-10-08",
      createdBy: "default",
    },
    {
      id: "7",
      name: "TypeScript",
      version: "4.9",
      status: "Building",
      created: "2023-10-16",
      createdBy: "admin",
      adminId: "current-admin",
    },
  ]
}

const statusConfig = {
  Ready: { color: "bg-green-100 text-green-800", icon: null },
  Building: { color: "bg-blue-100 text-blue-800", icon: Clock },
  Failed: { color: "bg-red-100 text-red-800", icon: X },
  "Scheduled for Deletion": { color: "bg-orange-100 text-orange-800", icon: Clock },
}

export default function LanguageImagesPage() {
  const [images] = useState<LanguageImage[]>(getLanguageImages())
  const [activeTab, setActiveTab] = useState<string>("All Images")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const tabs = ["All Images", "Building", "Ready", "Failed", "Scheduled for Deletion"]

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.version.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "All Images") return matchesSearch
    return matchesSearch && image.status === activeTab
  })

  const canEdit = (image: LanguageImage) => {
    return image.createdBy === "admin" && image.adminId === "current-admin"
  }

  const getActionButtons = (image: LanguageImage) => {
    const buttons = [
      <Link key="view" href={`/language-images/${image.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>,
    ]

    if (canEdit(image)) {
      if (image.status === "Ready") {
        buttons.push(
          <Button key="edit" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>,
        )
      }

      if (image.status === "Failed") {
        buttons.push(
          <Button key="retry" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>,
        )
      }

      buttons.push(
        <Button key="delete" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>,
      )
    }

    return buttons
  }

  return (
    <>
      <Header 
        title="Language Images" 
        description="Manage programming language runtime images for code execution." 
      >
        <div className="flex justify-end gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreateModal(true)}>
            Create New Image
          </Button>
          <Button variant="destructive">Prune All Images</Button>
        </div>
      </Header>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Main Content */}
          <div className="bg-white border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab
                        ? "border-teal-800 text-teal-800"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    )}
                  >
                    {tab}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {tab === "All Images" ? images.length : images.filter((img) => img.status === tab).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or version"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredImages.map((image) => {
                    const statusInfo = statusConfig[image.status]
                    const StatusIcon = statusInfo.icon

                    return (
                      <tr key={image.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs font-mono">{`</>`}</span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{image.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{image.version}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={cn("flex items-center gap-1 w-fit", statusInfo.color)}>
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {image.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{image.created}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={image.createdBy === "default" ? "secondary" : "outline"}>
                            {image.createdBy === "default" ? "Default" : "Custom"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">{getActionButtons(image)}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No language images found</div>
                <div className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateImageModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  )
}
