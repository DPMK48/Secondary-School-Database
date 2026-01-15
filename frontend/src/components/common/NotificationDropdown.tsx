import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { formatDate } from '../../utils/helpers';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: 'Results Approved',
    message: 'SS2 A results have been approved and published',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'New Student Enrolled',
    message: '3 new students have been added to SS1 B',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Pending Scores',
    message: 'Mathematics scores for SS3 are pending approval',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Attendance Marked',
    message: 'Daily attendance has been successfully recorded',
    time: '2 days ago',
    read: true,
  },
];

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-secondary-200 z-50 max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <div>
                <h3 className="font-semibold text-secondary-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-secondary-500">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 hover:bg-secondary-50 transition-colors cursor-pointer',
                        !notification.read && 'bg-primary-50/50'
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                notification.read
                                  ? 'text-secondary-700'
                                  : 'text-secondary-900'
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-secondary-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-secondary-200 p-3">
                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
