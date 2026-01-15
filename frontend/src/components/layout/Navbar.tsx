import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/helpers';
import { getRoleDisplayName } from '../../utils/permissions';
import { NotificationDropdown, GlobalSearch } from '../common';
import {
  Menu,
  ChevronLeft,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onSidebarToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Global Search */}
          <div className="hidden md:block flex-1 max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900">
                  {user?.username}
                </p>
                <p className="text-xs text-secondary-500">
                  {user?.role && getRoleDisplayName(user.role)}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-secondary-400 hidden md:block" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-secondary-100">
                    <p className="text-sm font-medium text-secondary-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-secondary-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/dashboard/settings');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-secondary-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
