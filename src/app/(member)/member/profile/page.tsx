import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Shield,
  CreditCard,
  LogOut
} from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function MemberProfilePage() {
  const session = await getSession();
  if (!session) return notFound();

  const member = await db.member.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!member) return notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={member.user.image || ""} />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {member.user.name?.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{member.user.name}</h1>
            <p className="text-muted-foreground">Member since May 2024</p>
            <div className="flex gap-2 pt-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Active</Badge>
              <Badge variant="outline">Gold Plan</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Account Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Verified Account</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Auto-pay enabled</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="w-4 h-4 opacity-50" /> Full Name</Label>
                <Input defaultValue={member.user.name || ""} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-50" /> Email Address</Label>
                <Input defaultValue={member.user.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-50" /> Phone Number</Label>
                <Input defaultValue={member.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-50" /> Location</Label>
                <Input defaultValue="Bangkok, Thailand" />
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t">
              <h4 className="font-bold">Preferences</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <span className="text-sm">Email Notifications</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <span className="text-sm">SMS Alerts</span>
                  <div className="w-10 h-5 bg-muted-foreground/20 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline">Cancel</Button>
            <Button className="px-8">Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
