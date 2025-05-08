import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, LineChart, Users, CheckCircle, Clock } from "lucide-react";

export function LandingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-border border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">HTech Assessment</span>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm">Admin Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Just the hero, no scrolling */}
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Text content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Event Management Assessment</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Admin Dashboard for <span className="text-primary">HTech</span> Events
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground">
              A comprehensive event management admin panel showcasing advanced UI patterns,
              data management, and user workflows.
            </p>
            
            <div className="flex gap-4 pt-2">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Enter Admin <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Details */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Event Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Attendee Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Real-time Dashboards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Registration Flows</span>
              </div>
            </div>
          </div>
          
          {/* Admin UI Preview - 3 columns */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            {/* Fake browser chrome */}
            <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <div className="text-xs text-muted-foreground ml-3 bg-background/40 px-3 py-1 rounded-md flex-1 text-center">
                admin.htech-events.example.com
              </div>
            </div>
            
            {/* Dashboard preview */}
            <div className="p-4 bg-background">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">Live</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Active Events</p>
                </div>
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-sm">+5%</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">1,245</p>
                  <p className="text-xs text-muted-foreground">Total Attendees</p>
                </div>
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-sm">+12%</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">$45.2K</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
              
              {/* Upcoming events section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Upcoming Events</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">View All</Button>
                </div>
                
                <div className="space-y-2">
                  {[
                    { name: "Tech Conference 2025", date: "May 15", attendees: 320 },
                    { name: "Product Launch", date: "May 22", attendees: 180 },
                    { name: "Marketing Workshop", date: "May 28", attendees: 45 }
                  ].map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> 
                            <span>{event.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium bg-background px-2 py-1 rounded border border-border">
                        {event.attendees} attendees
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}