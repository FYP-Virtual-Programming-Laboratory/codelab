"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { StudentLayout } from "@/components/student-layout"
import { StudentPageHeader } from "@/components/student-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Hash, Calendar } from "lucide-react"

export default function StudentProfilePage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [studentName, setStudentName] = useState("Student User")
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    matricNumber: "",
    email: "",
    joinDate: "2024-09-01",
  })

  useEffect(() => {
    if (email) {
      const nameParts = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))

      const firstName = nameParts[0] || "Student"
      const lastName = nameParts[1] || "User"
      const fullName = `${firstName} ${lastName}`

      setStudentName(fullName)
      setProfileData({
        firstName,
        lastName,
        matricNumber: "CSC/2024/001",
        email,
        joinDate: "2024-09-01",
      })
    }
  }, [email])

  const initials = studentName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const pageHeader = (
    <StudentPageHeader
      title="My Profile"
      description="View and manage your profile information"
      userEmail={email}
      showUserInfo={true}
    />
  )

  return (
    <StudentLayout studentEmail={email} studentName={studentName} pageSpecificHeader={pageHeader}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-500 text-white text-2xl font-medium">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{studentName}</CardTitle>
              <CardDescription>{profileData.email}</CardDescription>
            </CardHeader>
          </Card>

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Matric Number
                </Label>
                <Input
                  id="matricNumber"
                  value={profileData.matricNumber}
                  onChange={(e) => setProfileData({ ...profileData, matricNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Join Date
                </Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={profileData.joinDate}
                  onChange={(e) => setProfileData({ ...profileData, joinDate: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <Button className="w-full">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Your academic progress and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Sessions Completed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">88%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">A-</div>
                  <div className="text-sm text-gray-600">Current Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
