import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  RefreshCw,
  Download,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Users,
  Container,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react"
import { ResourceMetricCard } from "@/components/resource-metric-card"
import { SystemActivityChart } from "@/components/system-activity-chart"
import { ActiveSessionsTable } from "@/components/active-sessions-table"

// Dummy data for demonstration
const cpuUsage = 75
const memoryUsage = 60
const diskUsage = 80
const networkIO = 15
const activeSessions = [
  { id: 1, user: "john.doe", ipAddress: "192.168.1.100", loginTime: "2024-01-01 10:00:00" },
  { id: 2, user: "jane.smith", ipAddress: "192.168.1.101", loginTime: "2024-01-01 10:15:00" },
  { id: 3, user: "peter.jones", ipAddress: "192.168.1.102", loginTime: "2024-01-01 10:30:00" },
]

export default function SystemMonitorPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="System Monitor"
          breadcrumbs={[
            { label: "Dashboard", href: "/admin_dashboard" }, 
            { label: "System Monitor", href: "/admin_dashboard/system-monitor"},
          ]}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-refreshing every 30s • Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Now
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Resource Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ResourceMetricCard
                title="CPU Usage"
                value={cpuUsage}
                percentage={cpuUsage}
                unit="%"
                status={cpuUsage > 80 ? "critical" : cpuUsage > 60 ? "warning" : "healthy"}
                trend="up"
                icon={<Cpu className="h-5 w-5" />}
              />
              <ResourceMetricCard
                title="Memory Usage"
                value={memoryUsage}
                percentage={memoryUsage}
                unit="%"
                status={memoryUsage > 85 ? "critical" : memoryUsage > 70 ? "warning" : "healthy"}
                trend="stable"
                icon={<MemoryStick className="h-5 w-5" />}
              />
              <ResourceMetricCard
                title="Disk Usage"
                value={diskUsage}
                percentage={diskUsage}
                unit="%"
                status={diskUsage > 90 ? "critical" : diskUsage > 75 ? "warning" : "healthy"}
                trend="up"
                icon={<HardDrive className="h-5 w-5" />}
              />
              <ResourceMetricCard
                title="Network I/O"
                value={networkIO}
                percentage={networkIO}
                unit="MB/s"
                status="healthy"
                trend="down"
                icon={<Network className="h-5 w-5" />}
              />
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{activeSessions.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Running Containers</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                    <Container className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">7d 14h</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>System Activity (Last 30 minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemActivityChart />
              </CardContent>
            </Card>

            {/* Active Sessions and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActiveSessionsTable />
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">High CPU Usage</p>
                        <p className="text-xs text-red-600">CPU usage has exceeded 80% for the last 5 minutes</p>
                        <p className="text-xs text-red-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Memory Warning</p>
                        <p className="text-xs text-yellow-600">Memory usage approaching 75% threshold</p>
                        <p className="text-xs text-yellow-500 mt-1">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">System Update Available</p>
                        <p className="text-xs text-blue-600">A new system update is ready for installation</p>
                        <p className="text-xs text-blue-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
