import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  percentageChange?: number
  comparisonPeriod?: string
}

export function StatCard({ title, value, percentageChange, comparisonPeriod = "last year" }: StatCardProps) {
  return (
    <Card className="bg-white rounded-none border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {percentageChange !== undefined && (
          <p className="text-xs text-gray-500 flex items-center mt-1">
            <span className={`mr-1 ${percentageChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              ↑ {Math.abs(percentageChange)}%
            </span>
            vs {comparisonPeriod}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
