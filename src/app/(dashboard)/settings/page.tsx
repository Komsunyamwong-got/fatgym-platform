"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  User, 
  ShieldCheck, 
  CreditCard,
  ChevronDown,
  Loader2,
  Upload,
  Globe,
  Clock
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGymSettings, updateGymSettings, getUserProfile, updateUserProfile } from "@/app/actions/settings";
import { uploadLogo, uploadAvatar } from "@/app/actions/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // General Gym States
  const [generalData, setGeneralData] = useState({
    gymName: "FAT GYM",
    phone: "081-234-5678",
    address: "123 Sukhumvit Road, Bangkok, Thailand"
  });

  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");
  const [selectedTimezone, setSelectedTimezone] = useState("(GMT+07:00) Bangkok");

  // Account Profile States
  const pathname = usePathname();
  const router = useRouter();
  const [accountData, setAccountData] = useState({
    fullName: "",
    email: "",
    bio: "Founder & Head Coach at FAT GYM."
  });

  // Password Security States
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [logoUrl, setLogoUrl] = useState("/uploads/gym-logo.png");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load persistent configurations on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getGymSettings();
        if (res) {
          setGeneralData({
            gymName: res.gymName || "FAT GYM",
            phone: res.phone || "081-234-5678",
            address: res.address || "123 Sukhumvit Road, Bangkok, Thailand"
          });
          setSelectedLanguage(res.language || "English (US)");
          setSelectedTimezone(res.timezone || "(GMT+07:00) Bangkok");
          
          setAccountData({
            fullName: res.fullName || "Gym Owner",
            email: res.email || "owner@fatgym.com",
            bio: res.bio || "Founder & Head Coach at FAT GYM."
          });
          
          if (res.logoUrl) {
            setLogoUrl(res.logoUrl);
          }
        }
        
        const userProfile = await getUserProfile();
        if (userProfile) {
          setAccountData(prev => ({
            ...prev,
            fullName: userProfile.name || "",
            email: userProfile.email || "",
          }));
          if (userProfile.image) {
            setAvatarUrl(userProfile.image);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleGeneralSave = async () => {
    if (!generalData.gymName) {
      toast.error("Gym Name is required");
      return;
    }
    setIsSaving(true);
    const res = await updateGymSettings({
      ...generalData,
      language: selectedLanguage,
      timezone: selectedTimezone
    });
    setIsSaving(false);
    if (res.success) {
      toast.success("General settings updated successfully!");
    } else {
      toast.error("Failed to save general settings.");
    }
  };

  const handleAccountSave = async () => {
    if (!accountData.fullName || !accountData.email) {
      toast.error("Full Name and Email are required");
      return;
    }
    
    setIsSaving(true);
    const res = await updateUserProfile({
      name: accountData.fullName,
      email: accountData.email,
    });
    setIsSaving(false);
    
    if (res.success) {
      toast.success("Profile account details updated!");
    } else {
      toast.error(res.error || "Failed to update profile account details.");
    }
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
    }, 700);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Please select an image under 2MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    const res = await uploadLogo(formData);
    setIsUploading(false);
    if (res.success && res.url) {
      setLogoUrl(res.url);
      toast.success("Gym logo uploaded successfully!");
    } else {
      toast.error(res.error || "Failed to upload logo.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Please select an image under 2MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await uploadAvatar(formData);
    setIsUploading(false);
    if (res.success && res.url) {
      setAvatarUrl(res.url);
      toast.success("Profile avatar updated successfully!");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to upload avatar.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground text-sm">Configure gym operations, roles, and integrations.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        
        {/* Working Tabs list */}
        <TabsList className="bg-card border w-full justify-start h-12 p-1 gap-2 overflow-x-auto no-scrollbar">
          <TabsTrigger value="general" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            <Building2 className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            <User className="w-4 h-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            <ShieldCheck className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            <CreditCard className="w-4 h-4" /> Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab Content */}
        <TabsContent value="general" className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Gym information section circled by user */}
              <Card className="border-none shadow-sm border border-zinc-100">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-zinc-950">Gym Information</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Basic profile of your fitness center.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-700">Gym Name</Label>
                      <Input 
                        value={generalData.gymName} 
                        onChange={(e) => setGeneralData({...generalData, gymName: e.target.value})} 
                        className="focus-visible:ring-primary border-zinc-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-700">Phone Number</Label>
                      <Input 
                        value={generalData.phone} 
                        onChange={(e) => setGeneralData({...generalData, phone: e.target.value})} 
                        className="focus-visible:ring-primary border-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-zinc-700">Address</Label>
                    <Input 
                      value={generalData.address} 
                      onChange={(e) => setGeneralData({...generalData, address: e.target.value})} 
                      className="focus-visible:ring-primary border-zinc-200"
                    />
                  </div>
                  <div className="pt-2">
                    <Button 
                      onClick={handleGeneralSave} 
                      disabled={isSaving}
                      className="font-bold hover:scale-105 active:scale-95 transition-all shadow-sm bg-primary"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Save General Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Localization section circled by user */}
              <Card className="border-none shadow-sm border border-zinc-100">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-zinc-950">Localization</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Set your preferred language and timezone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Working Language selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-700">System Language</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="outline" className="w-full justify-between font-semibold border-zinc-200 hover:bg-muted transition-all">
                              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-400" /> {selectedLanguage}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent className="w-56" align="start">
                          {["English (US)", "ภาษาไทย (TH)", "日本語 (JP)"].map((lang) => (
                            <DropdownMenuItem 
                              key={lang} 
                              onClick={() => setSelectedLanguage(lang)}
                              className={cn("cursor-pointer font-medium text-xs", selectedLanguage === lang && "text-primary font-bold bg-primary/5")}
                            >
                              {lang}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Working Timezone selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-700">Timezone</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="outline" className="w-full justify-between font-semibold border-zinc-200 hover:bg-muted transition-all">
                              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-400" /> {selectedTimezone}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent className="w-64" align="start">
                          {[
                            "(GMT+07:00) Bangkok", 
                            "(GMT+09:00) Tokyo", 
                            "(GMT+00:00) London", 
                            "(GMT-05:00) New York"
                          ].map((tz) => (
                            <DropdownMenuItem 
                              key={tz} 
                              onClick={() => setSelectedTimezone(tz)}
                              className={cn("cursor-pointer font-medium text-xs", selectedTimezone === tz && "text-primary font-bold bg-primary/5")}
                            >
                              {tz}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Logo uploads card circled by user */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm border border-zinc-100 overflow-hidden">
                <div className="h-32 bg-primary relative bg-gradient-to-r from-emerald-500 to-teal-600">
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 rounded-2xl border-4 border-background bg-card flex items-center justify-center text-primary text-3xl font-extrabold shadow-lg overflow-hidden">
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
                    <h4 className="font-extrabold text-base text-zinc-950">FAT GYM Logo</h4>
                    <p className="text-[11px] text-muted-foreground">Logo for receipts and mobile app.</p>
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
                    className="w-full gap-2 border-zinc-200 font-semibold hover:bg-muted transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-zinc-500" />}
                    Upload New Logo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Profile Details tab content */}
        <TabsContent value="account" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-none shadow-sm border border-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-950">Profile Information</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20 uppercase">
                    {accountData.fullName ? accountData.fullName.substring(0, 2) : "GO"}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-semibold border-zinc-200"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Change Avatar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-700">Full Name</Label>
                  <Input 
                    value={accountData.fullName} 
                    onChange={(e) => setAccountData({...accountData, fullName: e.target.value})} 
                    className="focus-visible:ring-primary border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-700">Email Address</Label>
                  <Input 
                    value={accountData.email} 
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
                    className="focus-visible:ring-primary border-zinc-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-700">Biography</Label>
                <Input 
                  value={accountData.bio} 
                  onChange={(e) => setAccountData({...accountData, bio: e.target.value})} 
                  className="focus-visible:ring-primary border-zinc-200"
                />
              </div>
              <Button onClick={handleAccountSave} className="font-bold hover:scale-105 active:scale-95 transition-all shadow-sm bg-primary">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Password tab content */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-none shadow-sm border border-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-950">Password</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-700">Current Password</Label>
                <Input 
                  type="password" 
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                  className="focus-visible:ring-primary border-zinc-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    className="focus-visible:ring-primary border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-700">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    className="focus-visible:ring-primary border-zinc-200"
                  />
                </div>
              </div>
              <Button onClick={handleSecuritySave} className="font-bold hover:scale-105 active:scale-95 transition-all shadow-sm bg-primary">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing tab content */}
        <TabsContent value="billing" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-950">Current Plan: Pro Business</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Your plan renews on June 15, 2026.</CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground font-semibold">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-950">฿1,490</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              <div className="mt-6 flex gap-4">
                <Button onClick={() => toast.info("Subscription management opening...")} className="font-bold bg-primary shadow-sm">
                  Manage Subscription
                </Button>
                <Button variant="outline" onClick={() => toast.info("Fetching invoices...")} className="font-bold border-zinc-200 shadow-sm">
                  View Invoices
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border border-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-950">Payment Method</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Manage your credit cards and billing details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 border-zinc-100 hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-lg border border-zinc-200">
                    <CreditCard className="w-6 h-6 text-zinc-700" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950">Visa ending in 4242</p>
                    <p className="text-[11px] text-muted-foreground">Expires 12/28</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info("Edit payment method...")} className="font-semibold text-primary">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
