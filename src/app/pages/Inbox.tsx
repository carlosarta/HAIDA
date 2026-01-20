import { GlassCard } from "../components/ui/glass-card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Archive, CheckCircle2, Clock, Mail, Search, Trash2 } from "lucide-react"
import { Input } from "../components/ui/input"
import { cn } from "../components/ui/utils"

export function Inbox() {
  const notifications = [
    { id: 1, title: "Test Run Failed: Checkout Flow", desc: "The automated test suite 'Checkout' failed at step 3.", type: "system", time: "10m ago", read: false },
    { id: 2, title: "New Script Generated", desc: "Copilot finished generating the 'User Registration' script.", type: "script", time: "1h ago", read: false },
    { id: 3, title: "Project 'Alpha' Updated", desc: "Sarah added 3 new test cases to the project.", type: "project", time: "2h ago", read: true },
    { id: 4, title: "Weekly Report Available", desc: "Your weekly testing summary is ready to view.", type: "system", time: "1d ago", read: true },
    { id: 5, title: "System Maintenance", desc: "Scheduled maintenance for tonight at 2 AM EST.", type: "system", time: "2d ago", read: true },
  ];

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
           <p className="text-muted-foreground">Manage your notifications and alerts.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none">Mark all read</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         {/* Sidebar / Filters */}
         <div className="w-full md:w-64 space-y-4">
            <GlassCard className="p-2">
               <div className="relative mb-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8 bg-transparent border-none" />
               </div>
               <nav className="space-y-1">
                  <Button variant="secondary" className="w-full justify-start">
                     <Mail className="mr-2 h-4 w-4" /> All
                     <Badge className="ml-auto bg-primary text-white">2</Badge>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                     <Mail className="mr-2 h-4 w-4 opacity-50" /> Unread
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                     <Archive className="mr-2 h-4 w-4 opacity-50" /> Archived
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                     <Trash2 className="mr-2 h-4 w-4 opacity-50" /> Trash
                  </Button>
               </nav>
            </GlassCard>
            
            <GlassCard className="p-4">
               <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">Type</h3>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-red-500" />
                     <span className="text-sm">System Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-blue-500" />
                     <span className="text-sm">Script Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-green-500" />
                     <span className="text-sm">Project Activity</span>
                  </div>
               </div>
            </GlassCard>
         </div>

         {/* List */}
         <div className="flex-1 space-y-4">
            {notifications.map((item) => (
               <GlassCard key={item.id} className={cn("p-4 transition-all hover:bg-white/60 dark:hover:bg-slate-800/60", !item.read ? "border-l-4 border-l-primary" : "")}>
                  <div className="flex items-start gap-4">
                     <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        item.type === 'system' ? "bg-red-500/10 text-red-500" :
                        item.type === 'script' ? "bg-blue-500/10 text-blue-500" :
                        "bg-green-500/10 text-green-500"
                     )}>
                        {item.type === 'system' && <Clock className="h-5 w-5" />}
                        {item.type === 'script' && <Clock className="h-5 w-5" />}
                        {item.type === 'project' && <CheckCircle2 className="h-5 w-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h4 className={cn("text-base font-semibold truncate", !item.read ? "text-foreground" : "text-muted-foreground")}>{item.title}</h4>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                     </div>
                     <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                  </div>
               </GlassCard>
            ))}
         </div>
      </div>
    </div>
  )
}
