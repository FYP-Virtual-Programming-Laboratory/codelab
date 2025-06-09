"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface ActivityData {
  time: string
  cpu: number
  memory: number
  network: number
}

export function SystemActivityChart() {
  const [data, setData] = useState<ActivityData[]>([])

  useEffect(() => {
    // Generate initial data
    const initialData: ActivityData[] = []
    for (let i = 29; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
      initialData.push({
        time,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
      })
    }
    setData(initialData)

    // Update data every 30 seconds
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const time = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
        newData.push({
          time,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 100,
        })
        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const maxValue = 100

  return (
    <Card className="col-span-2">
      <CardHeader><CardTitle></CardTitle></CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <g key={value}>
                <line x1="0" y1={`${100 - value}%`} x2="100%" y2={`${100 - value}%`} stroke="#e5e7eb" strokeWidth="1" />
                <text x="0" y={`${100 - value}%`} dy="-4" fontSize="10" fill="#6b7280">
                  {value}%
                </text>
              </g>
            ))}

            {/* CPU Line */}
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              points={data
                .map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.cpu / maxValue) * 100}`)
                .join(" ")}
            />

            {/* Memory Line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={data
                .map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.memory / maxValue) * 100}`)
                .join(" ")}
            />

            {/* Network Line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={data
                .map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.network / maxValue) * 100}`)
                .join(" ")}
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">CPU</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Network</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
