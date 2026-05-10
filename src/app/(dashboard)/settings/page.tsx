"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  User, 
  Building2, 
  ShieldCheck, 
  Bell, 
  CreditCard,
  Languages,
  Database,
  Cloud,
  ChevronDown,
  Loader2,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateGymSettings } from "@/app/actions/settings";
import { uploadLogo } from "@/app/actions/upload";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form States
  const [generalData, setGeneralData] = useState({
    gymName: "FAT GYM",
    phone: "081-234-5678",
    address: "123 Sukhumvit Road, Bangkok, Thailand"
  });

  const [accountData, setAccountData] = useState({
    fullName: "Gym Owner",
    email: "owner@fatgym.com",
    bio: "Founder & Head Coach at FAT GYM."
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [logoUrl, setLogoUrl] = useState("/uploads/gym-logo.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeneralSave = async () => {
    if (!generalData.gymName) {
      toast.error("Gym Name is required");
      return;
    }
    setIsSaving(true);
    const res = await updateGymSettings(generalData);
    setIsSaving(false);
    if (res.success) toast.success("General settings updated!");
  };

  const handleAccountSave = async () => {
    if (!accountData.fullName || !accountData.email) {
      toast.error("Full Name and Email are required");
      return;
    }
    setIsSaving(true);
    // Simulating action
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 500);
  };

  const handleSecuritySave = async () => {
    if (!securityData.currentPassword || !securityData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Password changed successfully!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, 800);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    const res = await uploadLogo(formData);
    setIsUploading(false);
    if (res.success) {
      setLogoUrl(res.url + "?t=" + Date.now());
      toast.success("Logo uploaded successfully!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground text-sm">Configure gym operations, roles, and integrations.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card border w-full justify-start h-12 p-1 gap-2 overflow-x-auto no-scrollbar">
          <TabsTrigger value="general" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShieldCheck className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Gym Information</CardTitle>
                  <CardDescription>Basic profile of your fitness center.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gym Name</Label>
                      <Input 
                        value={generalData.gymName} 
                        onChange={(e) => setGeneralData({...generalData, gymName: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input 
                        value={generalData.phone} 
                        onChange={(e) => setGeneralData({...generalData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                      value={generalData.address} 
                      onChange={(e) => setGeneralData({...generalData, address: e.target.value})} 
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleGeneralSave} disabled={isSaving}>Save General Settings</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                  <CardDescription>Set your preferred language and timezone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>System Language</Label>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        English (US) <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        (GMT+07:00) Bangkok <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="h-32 bg-primary relative">
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 rounded-2xl border-4 border-background bg-card flex items-center justify-center text-primary text-3xl font-bold shadow-lg overflow-hidden">
                      <img 
                        src={logoUrl} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = 'FG';
                        }}
                        className="w-full h-full object-cover"
                        alt="Gym Logo"
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6 px-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg">FAT GYM Logo</h4>
                    <p className="text-xs text-muted-foreground">Logo for receipts and mobile app.</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload New Logo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  GO
                </div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={accountData.fullName} 
                    onChange={(e) => setAccountData({...accountData, fullName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    value={accountData.email} 
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Biography</Label>
                <Input 
                  value={accountData.bio} 
                  onChange={(e) => setAccountData({...accountData, bio: e.target.value})} 
                />
              </div>
              <Button onClick={handleAccountSave} disabled={isSaving}>Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password" 
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSecuritySave} disabled={isSaving}>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Current Plan: Pro Business</CardTitle>
                  <CardDescription>Your plan renews on June 15, 2026.</CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">฿1,490</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="mt-6 flex gap-4">
                <Button onClick={() => toast.info("Subscription management opening...")}>Manage Subscription</Button>
                <Button variant="outline" onClick={() => toast.info("Fetching invoices...")}>View Invoices</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your credit cards and billing details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                <div className="p-2 bg-background rounded-lg border">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/28</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info("Edit payment method...")}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
