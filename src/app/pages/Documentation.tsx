import { GlassCard } from "../components/ui/glass-card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import { Separator } from "../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  Book, 
  ChevronRight, 
  Code, 
  Edit3, 
  Eye, 
  FileText, 
  Filter, 
  GitBranch, 
  History, 
  MoreVertical, 
  Search, 
  Share2 
} from "lucide-react"
import { useState } from "react"
import { cn } from "../ui/utils"

export function Documentation() {
  const [view, setView] = useState<'list' | 'detail' | 'editor'>('list');

  const docs = [
    { id: 1, title: "Getting Started with HAIDA", desc: "Introduction to the testing framework and setup guide.", category: "Guide", author: "Sarah C.", updated: "2d ago", tags: ["Setup", "Basics"] },
    { id: 2, title: "API Authentication", desc: "How to handle OAuth2 tokens in your test scripts.", category: "API", author: "Mike R.", updated: "4h ago", tags: ["Security", "Auth"] },
    { id: 3, title: "Component Library Usage", desc: "Detailed props and examples for all UI components.", category: "Components", author: "Design Team", updated: "1w ago", tags: ["UI", "React"] },
    { id: 4, title: "CI/CD Integration", desc: "Configuring Jenkins and GitHub Actions pipelines.", category: "DevOps", author: "Alex T.", updated: "3d ago", tags: ["Pipeline", "Automation"] },
    { id: 5, title: "Writing Custom Reporters", desc: "Extend the reporting capabilities with custom logic.", category: "Advanced", author: "Sarah C.", updated: "1m ago", tags: ["Reporting", "Node.js"] },
  ];

  return (
    <div className="container p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">Manage and view project documentation.</p>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'list' && (
             <Button variant="outline" onClick={() => setView('list')}>Back to List</Button>
          )}
          <Button className="glass bg-primary text-primary-foreground" onClick={() => setView('editor')}>
             <Edit3 className="mr-2 h-4 w-4" /> New Doc
          </Button>
        </div>
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <GlassCard className="lg:col-span-1 p-4 h-fit space-y-6">
             <div className="relative">
               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Search docs..." className="pl-8 bg-white/5" />
             </div>
             
             <div className="space-y-4">
               <div>
                 <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Categories</h3>
                 <div className="space-y-1">
                   {["All", "Guide", "API", "Components", "DevOps", "Advanced"].map((cat) => (
                     <Button key={cat} variant="ghost" className="w-full justify-start h-8 px-2 text-sm">
                       {cat}
                     </Button>
                   ))}
                 </div>
               </div>
               
               <Separator className="bg-white/10" />
               
               <div>
                 <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {["Setup", "Security", "UI", "React", "Pipeline"].map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/50 hover:bg-secondary/70 cursor-pointer">{tag}</Badge>
                    ))}
                 </div>
               </div>
             </div>
          </GlassCard>

          {/* Doc Grid */}
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <GlassCard 
                key={doc.id} 
                className="p-6 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all group"
                onClick={() => setView('detail')}
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="border-primary/20 text-primary">{doc.category}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{doc.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{doc.desc}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                       {doc.author.charAt(0)}
                     </div>
                     <span>{doc.author}</span>
                   </div>
                   <span>{doc.updated}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {view === 'detail' && (
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
               <GlassCard className="p-8 min-h-[600px]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                     <span>Docs</span>
                     <ChevronRight className="h-4 w-4" />
                     <span>API</span>
                     <ChevronRight className="h-4 w-4" />
                     <span className="text-foreground font-medium">API Authentication</span>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                     <h1>API Authentication</h1>
                     <p className="lead">Learn how to securely authenticate your automated tests using OAuth2.</p>
                     
                     <Separator className="my-6" />
                     
                     <h2>Prerequisites</h2>
                     <p>Before you begin, ensure you have the following:</p>
                     <ul>
                        <li>Client ID and Secret from the Developer Portal</li>
                        <li>Environment variables configured</li>
                     </ul>
                     
                     <h3>Configuration Example</h3>
                     <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        {`// cypress.env.json
{
  "auth_url": "https://auth.example.com/token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_SECRET"
}`}
                     </div>
                     
                     <h2>Implementation Steps</h2>
                     <p>Use the <code>cy.request()</code> command to obtain the token before your tests run.</p>
                  </div>
               </GlassCard>
            </div>
            
            <div className="lg:col-span-1 space-y-4">
               <GlassCard className="p-4">
                  <h3 className="font-semibold mb-4">On this page</h3>
                  <div className="space-y-2 text-sm border-l-2 border-white/10 pl-4">
                     <div className="cursor-pointer text-primary border-l-2 border-primary -ml-[18px] pl-4 font-medium">Prerequisites</div>
                     <div className="cursor-pointer text-muted-foreground hover:text-foreground">Configuration Example</div>
                     <div className="cursor-pointer text-muted-foreground hover:text-foreground">Implementation Steps</div>
                     <div className="cursor-pointer text-muted-foreground hover:text-foreground">Common Errors</div>
                  </div>
               </GlassCard>
               
               <GlassCard className="p-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                     <GitBranch className="mr-2 h-4 w-4" /> View History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                     <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                     <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Button>
               </GlassCard>
            </div>
         </div>
      )}
      
      {view === 'editor' && (
         <div className="h-[calc(100vh-200px)] grid grid-cols-2 gap-4">
            <GlassCard className="flex flex-col overflow-hidden">
               <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-white/5">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><strong className="font-serif">B</strong></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><em className="font-serif">I</em></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><span className="underline">U</span></Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Code className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ImageIcon className="h-4 w-4"/></Button>
               </div>
               <textarea className="flex-1 resize-none p-4 bg-transparent border-none focus:outline-none font-mono text-sm" placeholder="# Start writing your documentation..." />
            </GlassCard>
            
            <GlassCard className="p-8 overflow-y-auto bg-white/60 dark:bg-slate-900/60">
               <div className="prose dark:prose-invert max-w-none opacity-50">
                  <h1>Untitled Document</h1>
                  <p>Preview will appear here...</p>
               </div>
            </GlassCard>
         </div>
      )}
    </div>
  )
}
