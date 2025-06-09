"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface CreateImageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateImageModal({ open, onOpenChange }: CreateImageModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    baseImage: "",
    fileExtension: "",
    executionCommand: "",
    description: "",
    requiresCompilation: false,
    buildScript: "",
  })
  const [dockerFile, setDockerFile] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const predefinedLanguages = [
    { name: "Python", extension: ".py", command: "python {filename}", baseImage: "python:3.11-slim" },
    { name: "JavaScript", extension: ".js", command: "node {filename}", baseImage: "node:18-alpine" },
    { name: "Java", extension: ".java", command: "java {filename}", baseImage: "openjdk:17-alpine" },
    { name: "C++", extension: ".cpp", command: "g++ {filename} -o output && ./output", baseImage: "gcc:latest" },
    { name: "Go", extension: ".go", command: "go run {filename}", baseImage: "golang:1.21-alpine" },
    { name: "Rust", extension: ".rs", command: "rustc {filename} && ./{basename}", baseImage: "rust:1.75" },
    { name: "C#", extension: ".cs", command: "dotnet run", baseImage: "mcr.microsoft.com/dotnet/sdk:8.0" },
    { name: "Ruby", extension: ".rb", command: "ruby {filename}", baseImage: "ruby:3.2-alpine" },
  ]

  const handleLanguageSelect = (languageName: string) => {
    const language = predefinedLanguages.find((lang) => lang.name === languageName)
    if (language) {
      setFormData((prev) => ({
        ...prev,
        name: language.name,
        fileExtension: language.extension,
        executionCommand: language.command,
        baseImage: language.baseImage,
        requiresCompilation: ["Java", "C++", "C#", "Rust"].includes(language.name),
      }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDockerFile(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Creating image with data:", formData)
    setIsSubmitting(false)
    onOpenChange(false)

    // Reset form
    setFormData({
      name: "",
      version: "",
      baseImage: "",
      fileExtension: "",
      executionCommand: "",
      description: "",
      requiresCompilation: false,
      buildScript: "",
    })
    setDockerFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Language Image</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 pr-2">
            {/* Quick Setup */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Setup (Optional)</Label>
              <p className="text-xs text-gray-500">Select a predefined language to auto-fill configuration</p>
              <div className="flex flex-wrap gap-2">
                {predefinedLanguages.map((lang) => (
                  <Button
                    key={lang.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLanguageSelect(lang.name)}
                    className="text-xs"
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Language Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Python, JavaScript"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="version" className="text-sm font-medium">
                    Version *
                  </Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 3.11, ES2023"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this language image and its use case"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Docker Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Docker Configuration</h3>

              <div>
                <Label htmlFor="baseImage" className="text-sm font-medium">
                  Base Docker Image *
                </Label>
                <Input
                  id="baseImage"
                  value={formData.baseImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, baseImage: e.target.value }))}
                  placeholder="e.g., python:3.11-slim, node:18-alpine"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Custom Dockerfile (Optional)</Label>
                <div className="mt-1">
                  {!dockerFile ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("dockerfile-upload")?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <div className="rounded-full p-2 bg-gray-100">
                          <Upload className="h-5 w-5 text-gray-500" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-900">Upload Dockerfile</p>
                        <p className="text-xs text-gray-500">Or drag and drop your Dockerfile here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{dockerFile}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDockerFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <input
                    id="dockerfile-upload"
                    type="file"
                    accept=".dockerfile,Dockerfile"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Execution Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Execution Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fileExtension" className="text-sm font-medium">
                    File Extension *
                  </Label>
                  <Input
                    id="fileExtension"
                    value={formData.fileExtension}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fileExtension: e.target.value }))}
                    placeholder="e.g., .py, .js, .java"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="compilation"
                    checked={formData.requiresCompilation}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requiresCompilation: checked }))}
                  />
                  <Label htmlFor="compilation" className="text-sm">
                    Requires Compilation
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable if the language needs to be compiled before execution</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="executionCommand" className="text-sm font-medium">
                    Execution Command *
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use {`{filename}`} as placeholder for the code file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="executionCommand"
                  value={formData.executionCommand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, executionCommand: e.target.value }))}
                  placeholder="e.g., python {filename}, node {filename}"
                  required
                  className="mt-1 font-mono text-sm"
                />
              </div>

              {formData.requiresCompilation && (
                <div>
                  <Label htmlFor="buildScript" className="text-sm font-medium">
                    Build Script
                  </Label>
                  <Textarea
                    id="buildScript"
                    value={formData.buildScript}
                    onChange={(e) => setFormData((prev) => ({ ...prev, buildScript: e.target.value }))}
                    placeholder="Commands to compile the code before execution"
                    rows={3}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            {formData.name && formData.version && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-mono">{`</>`}</span>
                    </div>
                    <span className="font-medium">
                      {formData.name} {formData.version}
                    </span>
                    <Badge variant="outline">Custom</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Base: {formData.baseImage || "Not specified"}</p>
                    <p>Extension: {formData.fileExtension || "Not specified"}</p>
                    <p>Command: {formData.executionCommand || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.version ||
              !formData.baseImage ||
              !formData.fileExtension ||
              !formData.executionCommand
            }
          >
            {isSubmitting ? "Creating..." : "Create Image"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
