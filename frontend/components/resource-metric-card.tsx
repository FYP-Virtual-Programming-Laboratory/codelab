"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResourceMetricCardProps {
  title: string
  value: number
  unit: string
  percentage: number
  trend?: "up" | "down" | "stable"
  status?: "healthy" | "warning" | "critical"
  icon: React.ReactNode
}

export function ResourceMetricCard({
  title,
  value,
  unit,
  percentage,
  trend = "stable",
  status = "healthy",
  icon,
}: ResourceMetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getProgressColor = () => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-teal-600">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold">
            {value} {unit}
          </div>
          <Badge className={cn("text-xs", getStatusColor())}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{percentage}% used</span>
            <span className="flex items-center gap-1">
              {getTrendIcon()} {trend}
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${getProgressColor()} 0%, ${getProgressColor()} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
