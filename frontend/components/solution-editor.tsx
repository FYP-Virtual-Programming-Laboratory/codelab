"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, Save, CheckCircle, Play, Download, ArrowLeft, Code } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FileDock } from "@/components/file-dock"

interface FileItem {
  id: string
  name: string
  content: string
  language: string
  isEntryPoint: boolean
  isModified: boolean
}

interface SolutionEditorProps {
  session: {
    languages: string[]
    title: string
  }
  question: {
    id: string
    title: string
    points: number
  }
  sessionId: string
  questionId: string
}

export function SolutionEditor({ session, question, sessionId, questionId }: SolutionEditorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // File management state
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "file-1",
      name: "main.py",
      content: `# ${question.title}
# Write your solution here

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        return " -> ".join(elements) + " -> NULL"

# Example usage
if __name__ == "__main__":
    ll = LinkedList()
    ll.insert_at_beginning(3)
    ll.insert_at_beginning(2)
    ll.insert_at_beginning(1)
    print(ll.display())
`,
      language: "Python",
      isEntryPoint: true,
      isModified: false,
    },
  ])
  const [activeFileId, setActiveFileId] = useState<string>("file-1")

  const activeFile = files.find((f) => f.id === activeFileId)

  const getFileExtension = (language: string) => {
    const extensions: Record<string, string> = {
      Python: "py",
      "C++": "cpp",
      Java: "java",
      JavaScript: "js",
      HTML: "html",
      CSS: "css",
      React: "jsx",
    }
    return extensions[language] || "txt"
  }

  const getDefaultContent = (language: string, fileName: string) => {
    const templates: Record<string, string> = {
      Python: `# ${question.title}
# Write your solution here

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()
`,
      "C++": `// ${question.title}
// Write your solution here

#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}
`,
      Java: `// ${question.title}
// Write your solution here

public class ${fileName.replace(/\.[^/.]+$/, "")} {
    public static void main(String[] args) {
        // Your code here
    }
}
`,
      JavaScript: `// ${question.title}
// Write your solution here

function main() {
    // Your code here
}

main();
`,
      HTML: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${question.title}</title>
</head>
<body>
    <!-- Your HTML here -->
</body>
</html>
`,
      CSS: `/* ${question.title} */
/* Write your styles here */

body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}
`,
    }
    return templates[language] || `// ${question.title}\n// Write your solution here\n`
  }

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId)
  }

  const handleFileCreate = (name: string, language: string) => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name,
      content: getDefaultContent(language, name),
      language,
      isEntryPoint: false,
      isModified: false,
    }
    setFiles((prev) => [...prev, newFile])
    setActiveFileId(newFile.id)
  }

  const handleFileRename = (fileId: string, newName: string) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, name: newName, isModified: true } : file)))
  }

  const handleFileDelete = (fileId: string) => {
    if (files.length === 1) return // Don't delete the last file

    setFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== fileId)
      // If we're deleting the active file, switch to the first remaining file
      if (fileId === activeFileId && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id)
      }
      return newFiles
    })
  }

  const handleEntryPointToggle = (fileId: string) => {
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        isEntryPoint: file.id === fileId ? !file.isEntryPoint : false,
        isModified: true,
      })),
    )
  }

  const handleCodeChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === activeFileId ? { ...file, content: newContent, isModified: true } : file)),
    )
  }

  const handleSave = () => {
    console.log("Saving files:", files)
    setFiles((prev) => prev.map((file) => ({ ...file, isModified: false })))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleSubmit = () => {
    const entryPointFile = files.find((f) => f.isEntryPoint)
    console.log("Submitting solution:", {
      files,
      entryPoint: entryPointFile?.name,
      questionId: question.id,
    })
    setIsSubmitted(true)
  }

  const handleRun = () => {
    const entryPointFile = files.find((f) => f.isEntryPoint)
    console.log("Running code:", {
      entryPoint: entryPointFile?.name || activeFile?.name,
      files,
    })
  }

  const downloadAllFiles = () => {
    files.forEach((file) => {
      const element = document.createElement("a")
      const fileBlob = new Blob([file.content], { type: "text/plain" })
      element.href = URL.createObjectURL(fileBlob)
      element.download = file.name
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    })
  }

  const handleBackToQuestion = () => {
    router.push(`/student_dashboard/sessions/${sessionId}`)
  }

  return (
    <Card className="bg-white border border-gray-200 h-fit py-5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Editor
          </CardTitle>
          <Button variant="outline" onClick={handleBackToQuestion} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Question
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        {/* File Dock */}
        <div className="px-6">
          <FileDock
            files={files}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileRename={handleFileRename}
            onFileDelete={handleFileDelete}
            onEntryPointToggle={handleEntryPointToggle}
            supportedLanguages={session.languages}
          />
        </div>

        <div className="px-6 space-y-6">
          {/* Active File Info */}
          {activeFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Editing: {activeFile.name}</Label>
                {activeFile.isEntryPoint && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Entry Point</span>
                )}
                {activeFile.isModified && <span className="text-xs text-orange-600">• Modified</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadAllFiles}>
                  <Download className="h-4 w-4 mr-1" />
                  Download All
                </Button>
                <Button variant="outline" size="sm" onClick={handleRun}>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          )}

          {/* Code Editor */}
          {activeFile && (
            <div>
              <Textarea
                placeholder={`Write your ${activeFile.language} code here...`}
                value={activeFile.content}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="font-mono text-sm min-h-[500px] resize-none"
              />
            </div>
          )}

          {/* Status Messages */}
          {isSaved && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">All files saved successfully!</span>
            </div>
          )}

          {isSubmitted && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Solution submitted successfully!</span>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              variant="outline"
              className="flex-1"
              disabled={!files.some((f) => f.isModified)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Files
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-teal-800 hover:bg-teal-700 text-white"
              disabled={!files.some((f) => f.content.trim()) || isSubmitted}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitted ? "Submitted" : "Submit Solution"}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-1">File Management Tips:</h4>
            <ul className="space-y-1">
              <li>• Click on file tabs to switch between files</li>
              <li>• Use the star icon to mark a file as the entry point for execution</li>
              <li>• Right-click on file tabs for more options (rename, delete, etc.)</li>
              <li>• Modified files are marked with an orange dot</li>
              <li>• Save frequently to avoid losing your work</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
