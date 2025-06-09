"use client"

import { useState } from "react"
import { Plus, FileText, Star, StarOff, MoreVertical, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface FileItem {
  id: string
  name: string
  content: string
  language: string
  isEntryPoint: boolean
  isModified: boolean
}

interface FileDockProps {
  files: FileItem[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFileCreate: (name: string, language: string) => void
  onFileRename: (fileId: string, newName: string) => void
  onFileDelete: (fileId: string) => void
  onEntryPointToggle: (fileId: string) => void
  supportedLanguages: string[]
}

export function FileDock({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
  onEntryPointToggle,
  supportedLanguages,
}: FileDockProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const getFileIcon = (language: string) => {
    return <FileText className="h-4 w-4" />
  }

  const getLanguageFromExtension = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      py: "Python",
      cpp: "C++",
      java: "Java",
      js: "JavaScript",
      jsx: "React",
      html: "HTML",
      css: "CSS",
    }
    return languageMap[extension || ""] || supportedLanguages[0]
  }

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const language = getLanguageFromExtension(newFileName)
      onFileCreate(newFileName.trim(), language)
      setNewFileName("")
      setIsCreating(false)
    }
  }

  const handleRename = (fileId: string) => {
    if (editingName.trim()) {
      onFileRename(fileId, editingName.trim())
      setEditingFileId(null)
      setEditingName("")
    }
  }

  const startRename = (file: FileItem) => {
    setEditingFileId(file.id)
    setEditingName(file.name)
  }

  const cancelRename = () => {
    setEditingFileId(null)
    setEditingName("")
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-2">
      <div className="flex items-center gap-1 overflow-x-auto">
        {/* File Tabs */}
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors min-w-0 group",
              activeFileId === file.id
                ? "bg-white border-gray-300 shadow-sm"
                : "bg-gray-100 border-gray-200 hover:bg-gray-200",
            )}
            onClick={() => onFileSelect(file.id)}
          >
            {/* File Icon */}
            <div className="flex-shrink-0">{getFileIcon(file.language)}</div>

            {/* File Name */}
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {editingFileId === file.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename(file.id)
                    } else if (e.key === "Escape") {
                      cancelRename()
                    }
                  }}
                  onBlur={() => handleRename(file.id)}
                  className="h-6 text-xs px-1 py-0"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="text-sm font-medium truncate">
                    {file.name}
                    {file.isModified && <span className="text-orange-500 ml-1">•</span>}
                  </span>
                  {file.isEntryPoint && <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />}
                </>
              )}
            </div>

            {/* File Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => startRename(file)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEntryPointToggle(file.id)}>
                    {file.isEntryPoint ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Remove Entry Point
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Entry Point
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onFileDelete(file.id)}
                    className="text-red-600 focus:text-red-600"
                    disabled={files.length === 1}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Create New File */}
        {isCreating ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <FileText className="h-4 w-4 text-gray-500" />
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFile()
                } else if (e.key === "Escape") {
                  setIsCreating(false)
                  setNewFileName("")
                }
              }}
              onBlur={handleCreateFile}
              placeholder="filename.ext"
              className="h-6 text-xs px-1 py-0 w-32"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">New File</span>
          </Button>
        )}
      </div>

      {/* Entry Point Info */}
      {files.some((f) => f.isEntryPoint) && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Entry Point: {files.find((f) => f.isEntryPoint)?.name}
          </Badge>
        </div>
      )}
    </div>
  )
}
