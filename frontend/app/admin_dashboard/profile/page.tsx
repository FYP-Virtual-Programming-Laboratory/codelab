import { Header } from "@/components/header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <>
      <Header title="Profile" description="Manage your account settings and preferences." />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-2xl mx-auto">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-teal-800 text-white">R</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change avatar
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue="Rhoda Ogunesan" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" defaultValue="rhodaogunesan@gmail.com" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Instructor" disabled />
                </div>

                <Button className="mt-4 bg-teal-800 hover:bg-teal-700 text-white">Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
