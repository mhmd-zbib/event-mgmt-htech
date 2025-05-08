import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Settings, 
  PieChart, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('auth_token');
  };

  const NavItems = () => (
    <>
      <Link 
        to="/admin/dashboard" 
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        <PieChart className="h-5 w-5" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/admin/events" 
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        <Calendar className="h-5 w-5" />
        <span>Events</span>
      </Link>
      <Link 
        to="/admin/users" 
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        <Users className="h-5 w-5" />
        <span>Users</span>
      </Link>
      <Link 
        to="/admin/settings" 
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">EventMaster</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-6 h-full">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <span className="text-xl font-bold">EventMaster</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col gap-1">
                    <NavItems />
                  </nav>
                  
                  <div className="mt-auto pb-6">
                    <Link to="/login" onClick={handleLogout}>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">John Doe</span>
            </div>
            <Link to="/login" onClick={handleLogout}>
              <Button 
                variant="ghost" 
                size="icon"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar - desktop only */}
        <aside className="hidden md:flex w-64 border-r bg-card flex-col">
          <nav className="p-4 flex flex-col gap-1">
            <NavItems />
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}