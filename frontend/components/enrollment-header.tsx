import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface EnrollmentHeaderProps {
  email: string
}

export function EnrollmentHeader({ email }: EnrollmentHeaderProps) {
  // Get first letter of email for avatar
  const initial = email ? email.charAt(0).toUpperCase() : "S"

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Available Sessions</h1>
            <p className="text-sm text-gray-600">Select a session to join</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{email}</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-teal-600 text-white">{initial}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
