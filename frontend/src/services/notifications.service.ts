import api from './axios';

export interface Activity {
  id: string;
  type: 'student_added' | 'teacher_added' | 'result_published' | 'attendance_marked' | 'session_created' | 'term_created';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: any;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

// Mock data for now - will be replaced with real API when backend is ready
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'student_added',
    title: 'New Student Added',
    description: 'John Doe was added to SSS 1A',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: 'Admin',
  },
  {
    id: '2',
    type: 'teacher_added',
    title: 'New Teacher Added',
    description: 'Jane Smith was added as Mathematics teacher',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: 'Admin',
  },
  {
    id: '3',
    type: 'result_published',
    title: 'Results Published',
    description: 'First Term results for SSS 2 published',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    user: 'Admin',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'System Update',
    message: 'The system will undergo maintenance tonight at 11 PM',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    type: 'success',
    title: 'Backup Completed',
    message: 'Database backup completed successfully',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const notificationsApi = {
  /**
   * Get recent activities
   */
  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    // TODO: Replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockActivities.slice(0, limit));
      }, 300);
    });
  },

  /**
   * Get notifications
   */
  getNotifications: async (limit: number = 10): Promise<Notification[]> => {
    // TODO: Replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockNotifications.slice(0, limit));
      }, 300);
    });
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    // TODO: Replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = mockNotifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
        }
        resolve();
      }, 200);
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    // TODO: Replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        mockNotifications.forEach((n) => (n.read = true));
        resolve();
      }, 200);
    });
  },
};
