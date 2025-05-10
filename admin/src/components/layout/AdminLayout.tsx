import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Tag,
  Clock,
  PlusCircle,
  BarChart4
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth/context/AuthContext';

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const NavItems = () => (
    <>
      <Link 
        to="/admin/events" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
          isActive('/admin/events') ? 'bg-accent font-medium' : ''
        }`}
      >
        <Calendar className="h-5 w-5" />
        <span>Events</span>
      </Link>
      <Link 
        to="/admin/categories" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
          isActive('/admin/categories') ? 'bg-accent font-medium' : ''
        }`}
      >
        <Tag className="h-5 w-5" />
        <span>Categories</span>
      </Link>
      <Link 
        to="/admin/users" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
          isActive('/admin/users') ? 'bg-accent font-medium' : ''
        }`}
      >
        <Users className="h-5 w-5" />
        <span>Attendees</span>
      </Link>
      <Link 
        to="/admin/reports" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
          isActive('/admin/reports') ? 'bg-accent font-medium' : ''
        }`}
      >
        <BarChart4 className="h-5 w-5" />
        <span>Reports</span>
      </Link>
      <Link 
        to="/admin/settings" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
          isActive('/admin/settings') ? 'bg-accent font-medium' : ''
        }`}
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
              <Calendar className="h-6 w-6 text-primary" />
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
                      <Calendar className="h-6 w-6 text-primary" />
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
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="default" 
              size="sm"
              className="gap-2"
              onClick={() => navigate('/admin/events/new')}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Event</span>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'D'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
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
          
          <div className="mt-auto p-4 border-t">
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Today's Events</p>
              </div>
              <p className="text-xs text-muted-foreground">You have 2 events scheduled for today</p>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs mt-1"
                onClick={() => navigate('/admin/events?date=today')}
              >
                View Today's Events
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}