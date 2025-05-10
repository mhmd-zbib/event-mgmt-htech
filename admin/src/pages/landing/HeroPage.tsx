import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, LineChart, Users, CheckCircle, Clock } from "lucide-react";

export default function HeroPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-border border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">EventMaster</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button size="sm">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Text content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Manage Events with <span className="text-primary">EventMaster</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground">
              Create, organize, and promote your events with our all-in-one platform. 
              Track registrations, communicate with attendees, and analyze your success.
            </p>
            
            <div className="flex gap-4 pt-2">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Admin Login <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Details */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Event Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Attendee Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Admin Controls</span>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview - 3 columns */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            {/* Fake browser chrome */}
            <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <div className="text-xs text-muted-foreground ml-3 bg-background/40 px-3 py-1 rounded-md flex-1 text-center">
                admin.eventmaster.example.com
              </div>
            </div>
            
            {/* Event listings preview */}
            <div className="p-4 bg-background">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">New</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">240+</p>
                  <p className="text-xs text-muted-foreground">Active Events</p>
                </div>
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-sm">+15%</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">12K</p>
                  <p className="text-xs text-muted-foreground">Registered Attendees</p>
                </div>
                <div className="bg-accent/30 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-sm">+8%</div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">92%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
              
              {/* Recent events section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Upcoming Events</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">View All</Button>
                </div>
                
                <div className="space-y-2">
                  {[
                    { title: "Tech Conference 2025", location: "San Francisco Convention Center", date: "May 15, 2025", type: "Conference" },
                    { title: "Product Launch", location: "Grand Hotel, New York", date: "May 22, 2025", type: "Corporate" },
                    { title: "Marketing Workshop", location: "Business Center, Chicago", date: "May 28, 2025", type: "Workshop" }
                  ].map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{event.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium bg-background px-2 py-1 rounded border border-border">
                        {event.type}
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