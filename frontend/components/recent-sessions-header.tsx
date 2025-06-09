import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface RecentSessionsHeaderProps {
  title?: string
  showStatusFilter?: boolean
  showFilter?: boolean
}

export function RecentSessionsHeader({
  title = "Recent sessions",
  showStatusFilter = true,
  showFilter = true,
}: RecentSessionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-3">
        {showStatusFilter && (
          <Button variant="outline" className="h-9 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <span className="mr-2">Status: All</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
        {showFilter && (
          <Button variant="outline" className="h-9 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <span className="mr-2">Filter</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
