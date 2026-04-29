import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, User, Users, Briefcase, Calendar, 
  MessageSquare, Bell, Settings, ShieldAlert, LogOut 
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const isAdmin = true; // In a real app, read from Auth Context

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
    { name: 'Directory', path: '/dashboard/directory', icon: <Users size={20} /> },
    { name: 'Jobs', path: '/dashboard/jobs', icon: <Briefcase size={20} /> },
    { name: 'Events', path: '/dashboard/events', icon: <Calendar size={20} /> },
    { name: 'Posts', path: '/dashboard/posts', icon: <MessageSquare size={20} /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/dashboard/admin', icon: <ShieldAlert size={20} /> });
  }

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900/50 transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
            A
          </div>
          <span className="font-bold text-xl text-secondary-800 dark:text-white">Connect</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-bold shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-200 dark:border-secondary-800">
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-2 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/30 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 p-4 flex justify-between items-center">
          <div className="font-bold text-lg text-secondary-800 dark:text-white">Connect</div>
          <button className="text-secondary-600 dark:text-secondary-400">
             <Home size={24} />
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
