"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Code, Users, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function LandingContent() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showStudentJoin, setShowStudentJoin] = useState(false)
  const [studentEmail, setStudentEmail] = useState("")
  const router = useRouter()

  const [studentExists, setStudentExists] = useState<boolean | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [matricNumber, setMatricNumber] = useState("")
  const [isCheckingStudent, setIsCheckingStudent] = useState(false)

  const handleAdminLogin = () => {
    // In a real app, you would validate credentials here
    setShowAdminLogin(false)
    router.push("/admin_dashboard")
  }

  const checkStudentExists = async (email: string) => {
    setIsCheckingStudent(true)
    // Simulate API call to check if student exists
    // In a real app, this would be an actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock check - you can replace this with actual logic
    const existingStudents = ["john.doe@example.com", "jane.smith@example.com"]
    const exists = existingStudents.includes(email.toLowerCase())

    setStudentExists(exists)
    setIsCheckingStudent(false)

    if (exists) {
      // Student exists, redirect to dashboard
      setShowStudentJoin(false)
      router.push(`/student_dashboard/sessions?email=${encodeURIComponent(email)}`)
    }
  }

  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentEmail) return

    if (studentExists === null) {
      // First time submitting, check if student exists
      await checkStudentExists(studentEmail)
    } else if (studentExists === false) {
      // Student doesn't exist, validate registration fields
      if (firstName && lastName && matricNumber) {
        // In a real app, you would create the student account here
        setShowStudentJoin(false)
        router.push(`/student_dashboard/sessions?email=${encodeURIComponent(studentEmail)}`)
      }
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and Welcome */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
            <Code className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Welcome to <span className="text-emerald-200">CodeLab</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Your collaborative coding environment for managing sessions, tracking progress, and building amazing
            projects together.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            onClick={() => setShowAdminLogin(true)}
            size="lg"
            className="bg-white text-emerald-800 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <UserCheck className="mr-3 h-6 w-6" />
            Login as Admin
          </Button>

          <Button
            onClick={() => setShowStudentJoin(true)}
            size="lg"
            className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-emerald-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Users className="mr-3 h-6 w-6" />
            Join as Student
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-emerald-900" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaborative Coding</h3>
              <p className="text-white/80 text-sm">
                Work together on coding projects with real-time collaboration and feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-emerald-900" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Session Management</h3>
              <p className="text-white/80 text-sm">
                Create and manage coding sessions with easy student enrollment and tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-6 w-6 text-emerald-900" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-white/80 text-sm">
                Monitor student progress and provide personalized feedback and guidance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Login Modal */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-emerald-800">Admin Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" placeholder="admin@codelab.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" placeholder="••••••••" />
            </div>
            <Button onClick={handleAdminLogin} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white mt-6">
              Login to Dashboard
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="#" className="text-emerald-600 hover:underline">
                Contact your administrator
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Join Modal */}
      <Dialog
        open={showStudentJoin}
        onOpenChange={(open) => {
          setShowStudentJoin(open)
          if (!open) {
            // Reset form when dialog closes
            setStudentEmail("")
            setFirstName("")
            setLastName("")
            setMatricNumber("")
            setStudentExists(null)
            setIsCheckingStudent(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-emerald-800">Join as Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStudentJoin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="student-email">Your Email Address</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="your.email@example.com"
                value={studentEmail}
                onChange={(e) => {
                  setStudentEmail(e.target.value)
                  setStudentExists(null) // Reset student check when email changes
                }}
                required
                disabled={isCheckingStudent || studentExists === false}
              />
            </div>

            {studentExists === false && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matric-number">Matric Number</Label>
                  <Input
                    id="matric-number"
                    type="text"
                    placeholder="U12345678"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white mt-6"
              disabled={isCheckingStudent}
            >
              {isCheckingStudent
                ? "Checking..."
                : studentExists === null
                  ? "Continue"
                  : studentExists === false
                    ? "Register & Continue"
                    : "Login"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              {studentExists === false
                ? "Please complete your registration to continue."
                : "Enter your email to access available sessions."}{" "}
              <a href="#" className="text-emerald-600 hover:underline">
                Need help?
              </a>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
