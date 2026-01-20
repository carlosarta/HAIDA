import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function StyleGuide() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground text-lg">
          Overview of the design tokens and theme application.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Typography</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <h1>Heading 1 (2xl: 32px)</h1>
            <p className="text-muted-foreground">Inter Medium</p>
          </div>
          <div className="space-y-2">
            <h2>Heading 2 (xl: 24px)</h2>
            <p className="text-muted-foreground">Inter Medium</p>
          </div>
          <div className="space-y-2">
            <h3>Heading 3 (lg: 18px)</h3>
            <p className="text-muted-foreground">Inter Medium</p>
          </div>
          <div className="space-y-2">
            <h4>Heading 4 (md: 16px)</h4>
            <p className="text-muted-foreground">Inter Medium</p>
          </div>
          <div className="space-y-2">
            <p>Body Text (md: 16px)</p>
            <p className="text-muted-foreground">Inter Regular. The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Colors</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorCard name="Background" variable="bg-background" text="text-foreground" />
          <ColorCard name="Foreground" variable="bg-foreground" text="text-background" />
          <ColorCard name="Card" variable="bg-card" text="text-card-foreground" />
          <ColorCard name="Popover" variable="bg-popover" text="text-popover-foreground" />
          <ColorCard name="Primary" variable="bg-primary" text="text-primary-foreground" />
          <ColorCard name="Secondary" variable="bg-secondary" text="text-secondary-foreground" />
          <ColorCard name="Muted" variable="bg-muted" text="text-muted-foreground" />
          <ColorCard name="Accent" variable="bg-accent" text="text-accent-foreground" />
          <ColorCard name="Destructive" variable="bg-destructive" text="text-destructive-foreground" />
          <ColorCard name="Success" variable="bg-success" text="text-white" />
          <ColorCard name="Warning" variable="bg-warning" text="text-white" />
          <ColorCard name="Error" variable="bg-error" text="text-white" />
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Glassmorphism & Cards</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Using the glass utility class</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a backdrop blur effect applied to it, simulating frosted glass.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Default card styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a standard card component using the defined theme colors.</p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">Secondary Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Form Elements</h2>
        <div className="grid max-w-sm gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Email address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
          <Button className="w-full">Sign In</Button>
        </div>
      </section>
    </div>
  );
}

function ColorCard({ name, variable, text }: { name: string; variable: string; text?: string }) {
  return (
    <div className="rounded-lg border p-4 flex flex-col items-center justify-center gap-2 aspect-square text-center">
      <div className={`w-full flex-1 rounded-md shadow-sm ${variable} flex items-center justify-center`}>
        {text && <span className={`${text} text-xs font-mono opacity-80`}>Aa</span>}
      </div>
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-muted-foreground font-mono">{variable}</div>
    </div>
  );
}
