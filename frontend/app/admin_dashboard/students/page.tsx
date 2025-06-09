import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function StudentsPage() {
  return (
    <>
      <Header title="All students" description="Manage all students enrolled in your sessions." />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for students..." className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-9 bg-white">
                  Filter
                </Button>
              </div>
            </div>

            <div className="border rounded-md p-8 text-center">
              <h3 className="text-lg font-medium">Student list will appear here</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add students to your sessions to see them listed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
