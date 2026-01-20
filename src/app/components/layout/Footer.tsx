import { Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "../ui/button"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-semibold text-foreground">Figma Make</span>. 
            The source code is available on <span className="underline underline-offset-4">GitHub</span>.
          </p>
        </div>
        <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Github className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Twitter className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Linkedin className="h-4 w-4"/>
            </Button>
        </div>
      </div>
    </footer>
  )
}
