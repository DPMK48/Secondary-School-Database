import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, APP_NAME } from '../../utils/constants';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Settings,
  CheckCircle,
  Edit,
  X,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Settings,
  CheckCircle,
  Edit,
};

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = user?.role ? (NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || []) : [];

  const renderNavItem = (item: { label: string; path: string; icon: string }) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    const isActive = location.pathname === item.path || 
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onMobileClose}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          'hover:bg-primary-50 hover:text-primary-700',
          isActive
            ? 'bg-primary-100 text-primary-700 font-medium'
            : 'text-secondary-600'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-600')} />
        {isOpen && <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-secondary-200">
        <img 
          src="/icons/logo.png" 
          alt="chool Management System Logo" 
          className="h-10 w-10 rounded-xl object-contain"
        />
        {isOpen && (
          <div>
            <h1 className="font-bold text-lg text-secondary-900">{APP_NAME}</h1>
            <p className="text-xs text-secondary-500">Data Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

  
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-secondary-200 z-30',
          'hidden lg:flex flex-col transition-all duration-300',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-secondary-200 z-50',
          'flex flex-col w-64 lg:hidden transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-secondary-500 hover:text-secondary-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
