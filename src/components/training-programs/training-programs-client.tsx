"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Play, 
  Clock, 
  Dumbbell, 
  ChevronRight, 
  Plus, 
  Copy, 
  Calendar,
  Users,
  Target,
  FileDown,
  Info,
  CheckCircle2,
  Trash2,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

// Standard preset master templates for Importing
const PRESET_TEMPLATES = [
  {
    id: "T001",
    name: "Cardio Shred Protocol",
    goal: "Cardio",
    level: "Beginner",
    duration: "6 Weeks",
    sessions: 18,
    color: "from-teal-500/10 to-teal-500/5 text-teal-600",
    description: "Designed for high-intensity fat burning and aerobic capacity elevation using metabolic conditioning."
  },
  {
    id: "T002",
    name: "Powerbuilding Peak Focus",
    goal: "Strength",
    level: "Advanced",
    duration: "12 Weeks",
    sessions: 48,
    color: "from-rose-500/10 to-rose-500/5 text-rose-600",
    description: "Combines powerlifting heavy compound metrics with classical hypertrophy accessory splits."
  },
  {
    id: "T003",
    name: "Olympic Weightlifting Prep",
    goal: "Performance",
    level: "Intermediate",
    duration: "10 Weeks",
    sessions: 30,
    color: "from-indigo-500/10 to-indigo-500/5 text-indigo-600",
    description: "Master the Snatch and Clean & Jerk. Focuses strictly on mobility, speed, and heavy triple percentages."
  }
];

export function TrainingProgramsClient() {
  // Core dynamic state
  const [programsList, setProgramsList] = useState<any[]>([
    {
      id: "P001",
      name: "Fat Loss Beginner",
      goal: "Fat Loss",
      level: "Beginner",
      duration: "12 Weeks",
      sessions: 36,
      activeClients: 15,
      lastUpdated: "2024-05-01",
      color: "from-orange-500/10 to-orange-500/5 text-orange-600",
      description: "Designed for individuals starting their weight loss journey. Focuses on safe calorie burns, structural mobility, and general physical preparation."
    },
    {
      id: "P002",
      name: "Strength Foundation",
      goal: "Strength",
      level: "Intermediate",
      duration: "8 Weeks",
      sessions: 24,
      activeClients: 8,
      lastUpdated: "2024-04-20",
      color: "from-blue-500/10 to-blue-500/5 text-blue-600",
      description: "Focuses on developing raw force output through primary compound barbell movements: squat, bench, and deadlift."
    },
    {
      id: "P003",
      name: "Muscle Gain Pro",
      goal: "Muscle Gain",
      level: "Advanced",
      duration: "16 Weeks",
      sessions: 64,
      activeClients: 5,
      lastUpdated: "2024-05-05",
      color: "from-purple-500/10 to-purple-500/5 text-purple-600",
      description: "Advanced mechanical tension and metabolic stress protocols targeting progressive hypertrophy splits for seasoned bodybuilders."
    },
    {
      id: "P004",
      name: "HYROX Preparation",
      goal: "Performance",
      level: "Intermediate",
      duration: "10 Weeks",
      sessions: 40,
      activeClients: 12,
      lastUpdated: "2024-05-08",
      color: "from-green-500/10 to-green-500/5 text-green-600",
      description: "Specially tailored for hybrid athletes prep. Focuses on running intervals, sled push power, rowing, and heavy wall balls."
    },
  ]);

  // Dialog & Active State control
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewProgramOpen, setIsNewProgramOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New program form values & errors (strict English validations)
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState("Fat Loss");
  const [formLevel, setFormLevel] = useState("Beginner");
  const [formDuration, setFormDuration] = useState("12 Weeks");
  const [formSessions, setFormSessions] = useState("36");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Client Assignment State inside program detail popup
  const [assignName, setAssignName] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Dynamic success toast utility
  const showNotification = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Import Action Handler
  const handleImport = (template: any) => {
    // Check if already imported to avoid duplicate
    if (programsList.some(p => p.name === template.name)) {
      showNotification(`"${template.name}" has already been imported.`);
      setIsImportOpen(false);
      return;
    }

    const newProg = {
      id: `P00${programsList.length + 1}`,
      name: template.name,
      goal: template.goal,
      level: template.level,
      duration: template.duration,
      sessions: template.sessions,
      activeClients: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      color: template.color,
      description: template.description
    };

    setProgramsList([...programsList, newProg]);
    showNotification(`Successfully imported "${template.name}" master template!`);
    setIsImportOpen(false);
  };

  // Submit New Program Form with rigorous validation
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName || formName.trim().length < 3) {
      errors.name = "Program name must be at least 3 characters.";
    }

    const sessionsNum = parseInt(formSessions);
    if (!formSessions || isNaN(sessionsNum) || sessionsNum < 1 || sessionsNum > 100) {
      errors.sessions = "Sessions must be a valid number between 1 and 100.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Pick a beautiful color variant based on Goal
    const colors = [
      "from-indigo-500/10 to-indigo-500/5 text-indigo-600",
      "from-pink-500/10 to-pink-500/5 text-pink-600",
      "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
      "from-amber-500/10 to-amber-500/5 text-amber-600"
    ];
    const randomColor = colors[programsList.length % colors.length];

    const newProg = {
      id: `P00${programsList.length + 1}`,
      name: formName.trim(),
      goal: formGoal,
      level: formLevel,
      duration: formDuration,
      sessions: sessionsNum,
      activeClients: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      color: randomColor,
      description: formDescription.trim() || "Custom premium physical development program designed for optimal results."
    };

    setProgramsList([...programsList, newProg]);
    showNotification(`"${formName.trim()}" created successfully!`);
    
    // Reset Form fields
    setFormName("");
    setFormGoal("Fat Loss");
    setFormLevel("Beginner");
    setFormDuration("12 Weeks");
    setFormSessions("36");
    setFormDescription("");
    setFormErrors({});
    setIsNewProgramOpen(false);
  };

  // Delete Program Handler
  const handleDeleteProgram = (id: string) => {
    setProgramsList(programsList.filter(p => p.id !== id));
    showNotification("Training program removed successfully.");
    setSelectedProgram(null);
  };

  // Client Assignment Handler
  const handleAssignClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignName.trim()) return;

    // Update client count dynamically in our local state
    setProgramsList(programsList.map(p => {
      if (p.id === selectedProgram.id) {
        return { ...p, activeClients: p.activeClients + 1 };
      }
      return p;
    }));

    setAssignSuccess(true);
    setAssignName("");
    setTimeout(() => {
      setAssignSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification Banner */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 text-white py-3 px-5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Training Programs</h2>
          <p className="text-muted-foreground text-sm">Manage program templates and client assignments.</p>
        </div>
        <div className="flex gap-2">
          {/* Import Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all">
                  <Copy className="w-4 h-4" /> Import
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Gym Templates</DialogTitle>
                <DialogDescription>Choose a verified, pre-built master template to import into your dashboard.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-2">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <div 
                    key={tmpl.id} 
                    className="p-4 border rounded-xl hover:border-primary/50 cursor-pointer transition-all bg-card/50 flex flex-col justify-between gap-2"
                    onClick={() => handleImport(tmpl)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-zinc-900">{tmpl.name}</h4>
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-primary/10 text-primary">
                        {tmpl.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
                    <div className="flex gap-4 text-xs font-semibold text-zinc-700 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {tmpl.duration}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tmpl.sessions} Sessions</span>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>

          {/* New Program Dialog */}
          <Dialog open={isNewProgramOpen} onOpenChange={setIsNewProgramOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> New Program
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Program</DialogTitle>
                <DialogDescription>Enter training template properties below. All validation errors are in English.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProgram} noValidate className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Program Name</label>
                  <input 
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Core Crusher Elite"
                    className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {formErrors.name && <p className="text-xs font-semibold text-red-600">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Goal Focus</label>
                    <select
                      value={formGoal}
                      onChange={(e) => setFormGoal(e.target.value)}
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Fat Loss">Fat Loss</option>
                      <option value="Strength">Strength</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Performance">Performance</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Level</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Duration</label>
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="4 Weeks">4 Weeks</option>
                      <option value="6 Weeks">6 Weeks</option>
                      <option value="8 Weeks">8 Weeks</option>
                      <option value="10 Weeks">10 Weeks</option>
                      <option value="12 Weeks">12 Weeks</option>
                      <option value="16 Weeks">16 Weeks</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Sessions</label>
                    <input 
                      type="number"
                      value={formSessions}
                      onChange={(e) => setFormSessions(e.target.value)}
                      placeholder="36"
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {formErrors.sessions && <p className="text-xs font-semibold text-red-600">{formErrors.sessions}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Description (Optional)</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a brief summary of the program focus..."
                    rows={3}
                    className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full font-bold shadow-sm">Save Training Program</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {programsList.map((program) => (
          <Card key={program.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group active:scale-[0.99] flex flex-col justify-between">
            <CardHeader className={cn("pb-4", program.color)}>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-none font-bold uppercase tracking-widest text-[10px]">
                  {program.level}
                </Badge>
                <div className="p-2 bg-background/50 rounded-lg backdrop-blur-sm">
                  <Dumbbell className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="mt-4 group-hover:text-primary transition-colors">{program.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Target className="w-3 h-3" /> {program.goal}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Duration</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-primary" /> {program.duration}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sessions</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-primary" /> {program.sessions}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{program.activeClients} Active Clients</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/30 p-2">
              {/* Card View Details Button Dialog */}
              <Dialog>
                <DialogTrigger
                  render={
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between hover:bg-primary hover:text-primary-foreground group-hover:translate-x-1 transition-all font-semibold"
                      onClick={() => setSelectedProgram(program)}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-lg">
                  {selectedProgram && (
                    <>
                      <DialogHeader>
                        <div className="flex justify-between items-start mr-6">
                          <DialogTitle className="text-xl font-extrabold">{selectedProgram.name}</DialogTitle>
                          <Badge className="font-extrabold border-none text-[10px] bg-emerald-100 text-emerald-800 uppercase">
                            {selectedProgram.level}
                          </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Goal: {selectedProgram.goal}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedProgram.duration}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedProgram.sessions} Sessions</span>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 my-2 text-sm text-zinc-800">
                        {/* Summary description */}
                        <div className="p-3 bg-muted/30 rounded-xl border text-xs">
                          <h4 className="font-bold mb-1 flex items-center gap-1.5"><Info className="w-4 h-4 text-primary" /> Program Focus Description</h4>
                          <p className="text-muted-foreground leading-relaxed">{selectedProgram.description || "Designed for maximum hypertrophy, force adaptation, and physiological structural endurance."}</p>
                        </div>

                        {/* Week-by-Week Curriculum accordion style display */}
                        <div className="space-y-2.5">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Detailed Curriculum Timeline</h4>
                          
                          <div className="p-3 rounded-lg border bg-card/60 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">W1-4</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-xs">Accumulation Phase (Preparation)</h5>
                              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">High volume endurance base, heavy structural motor training.</p>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border bg-card/60 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">W5-8</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-xs">Overloading Phase (Overload Strength)</h5>
                              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Progressive compounds overload, increased weights, high density splits.</p>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border bg-card/60 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">W9+</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-xs">Peak Taper Phase (Max Output)</h5>
                              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Absolute peaking percentage workouts, low repetition intensity taper.</p>
                            </div>
                          </div>
                        </div>

                        {/* Assign active member selector inside program */}
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <UserPlus className="w-4 h-4 text-primary" /> Assign to Member
                          </h4>
                          {assignSuccess ? (
                            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Member successfully assigned to this training program!</span>
                            </div>
                          ) : (
                            <form onSubmit={handleAssignClient} className="flex gap-2">
                              <select 
                                value={assignName}
                                onChange={(e) => setAssignName(e.target.value)}
                                className="flex-1 p-2 rounded-lg border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select active gym member...</option>
                                <option value="John Doe">John Doe (M-2024-001)</option>
                                <option value="Alice Johnson">Alice Johnson (M-2024-003)</option>
                                <option value="Fiona Taylor">Fiona Taylor (M-2024-008)</option>
                                <option value="Michael Clark">Michael Clark (M-2024-015)</option>
                              </select>
                              <Button type="submit" size="sm" className="font-bold text-xs px-4" disabled={!assignName}>Assign</Button>
                            </form>
                          )}
                        </div>
                      </div>

                      <DialogFooter className="mt-4 flex justify-between items-center bg-zinc-50 border-t">
                        <Button 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 text-xs font-bold"
                          onClick={() => handleDeleteProgram(selectedProgram.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete Program
                        </Button>
                        <DialogClose render={<Button variant="outline" className="text-xs font-semibold" />}>
                          Close
                        </DialogClose>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Grid containing logs & side banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Session Logs Panel */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary fill-primary" />
              Recent Session Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { week: "W1", title: "Lower Body Power", subtitle: "Strength Foundation • John Doe", time: "Today, 10:30 AM", volume: "4,680 kg", duration: "52 min" },
                { week: "W2", title: "Upper Body Hypertrophy", subtitle: "Muscle Gain Pro • Alice Johnson", time: "Yesterday, 3:15 PM", volume: "5,120 kg", duration: "60 min" },
                { week: "W3", title: "Metabolic Aerobic Shred", subtitle: "Fat Loss Beginner • Fiona Taylor", time: "May 20, 08:45 AM", volume: "N/A", duration: "45 min" },
              ].map((log, index) => (
                <Dialog key={index}>
                  <DialogTrigger
                    render={
                      <div 
                        className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {log.week}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900">{log.title}</h4>
                            <p className="text-xs text-muted-foreground">{log.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-emerald-600">Completed</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    }
                  />
                  <DialogContent className="sm:max-w-md">
                    {selectedLog && (
                      <>
                        <DialogHeader>
                          <div className="flex justify-between items-center mr-6">
                            <DialogTitle className="text-lg font-black">{selectedLog.title}</DialogTitle>
                            <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">COMPLETED</Badge>
                          </div>
                          <DialogDescription className="text-xs text-muted-foreground mt-0.5">{selectedLog.subtitle}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-2 text-sm text-zinc-800">
                          {/* Top metrics summary grid */}
                          <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-xl border text-center">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">Duration</p>
                              <p className="text-sm font-extrabold text-zinc-900">{selectedLog.duration}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">Total Volume</p>
                              <p className="text-sm font-extrabold text-zinc-900">{selectedLog.volume}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-muted-foreground">Logged Time</p>
                              <p className="text-xs font-semibold text-zinc-800 truncate mt-0.5">{selectedLog.time.split(",")[0]}</p>
                            </div>
                          </div>

                          {/* Exercise listing */}
                          <div className="space-y-2">
                            <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Executed Workouts Log</h5>
                            <div className="space-y-1.5">
                              <div className="p-2 rounded-lg border bg-card flex justify-between items-center text-xs">
                                <span className="font-bold">1. Barbell Back Squats</span>
                                <span className="text-muted-foreground font-semibold">4 sets x 8 reps (120 kg)</span>
                              </div>
                              <div className="p-2 rounded-lg border bg-card flex justify-between items-center text-xs">
                                <span className="font-bold">2. Romanian Deadlifts</span>
                                <span className="text-muted-foreground font-semibold">3 sets x 10 reps (100 kg)</span>
                              </div>
                              <div className="p-2 rounded-lg border bg-card flex justify-between items-center text-xs">
                                <span className="font-bold">3. Leg Extensions</span>
                                <span className="text-muted-foreground font-semibold">3 sets x 12 reps (70 kg)</span>
                              </div>
                              <div className="p-2 rounded-lg border bg-card flex justify-between items-center text-xs">
                                <span className="font-bold">4. Standing Calf Raises</span>
                                <span className="text-muted-foreground font-semibold">4 sets x 15 reps (80 kg)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-start gap-2 border border-blue-100">
                            <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>This workout log has been validated by Head Coach Alex and matched the designated program template specifications.</span>
                          </div>
                        </div>

                        <DialogFooter showCloseButton />
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Banners Program templates card */}
        <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative flex flex-col justify-between p-6">
          <div className="relative z-10 space-y-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Program Templates</h3>
              <p className="text-primary-foreground/70 text-xs mt-1">Quickly assign pre-built templates to new members.</p>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              Use our verified program templates designed by FAT GYM Head Coaches to ensure consistent results across all clients.
            </p>
          </div>
          <div className="relative z-10 mt-6">
            <Button 
              variant="secondary" 
              className="w-full font-bold shadow-sm hover:scale-105 active:scale-95 transition-all text-xs py-2.5"
              onClick={() => setIsImportOpen(true)}
            >
              Browse Templates
            </Button>
          </div>
          <Dumbbell className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 pointer-events-none" />
        </Card>
      </div>
    </div>
  );
}
