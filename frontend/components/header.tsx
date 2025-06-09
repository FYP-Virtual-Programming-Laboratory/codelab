import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateSessionButton } from "@/components/create-session-button"

interface HeaderProps {
  title: string
  children?: React.ReactNode
  description?: string
  breadcrumbs?: Array<{
    label: string
    href: string
  }>
}

export function Header({ title, description, breadcrumbs, children }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">›</span>}
                  <a href={crumb.href} className="hover:text-gray-700">
                    {crumb.label}
                  </a>
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {children}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
