import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-bold">EventMaster</span>
          </Link>
        </div>
        
        <Link to="/login" onClick={() => logout()}>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </Link>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r bg-gray-50 p-4">
          <nav className="flex flex-col gap-2">
            <Link 
              to="/admin/dashboard" 
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </aside>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}