import api from './axios';

export type ActivityType = 
  | 'student_added' 
  | 'student_updated' 
  | 'student_deleted'
  | 'teacher_added' 
  | 'teacher_updated'
  | 'teacher_deleted'
  | 'teacher_assigned'
  | 'result_entered'
  | 'result_updated'
  | 'result_published' 
  | 'attendance_marked' 
  | 'session_created' 
  | 'session_activated'
  | 'term_created'
  | 'term_activated'
  | 'class_created'
  | 'class_updated'
  | 'subject_created'
  | 'subject_updated'
  | 'user_login'
  | 'password_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  userRole?: string;
  metadata?: Record<string, any>;
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

// Fallback mock data in case API fails
const fallbackActivities: Activity[] = [
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
    type: 'result_entered',
    title: 'Results Entered',
    description: 'First Term results for SSS 2 entered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    user: 'Subject Teacher',
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
   * Get recent activities from backend
   */
  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    try {
      const response = await api.get<Activity[]>(`/activities/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities, using fallback:', error);
      // Return fallback data if API fails
      return fallbackActivities.slice(0, limit);
    }
  },

  /**
   * Get all activities with pagination
   */
  getAllActivities: async (limit: number = 20, offset: number = 0): Promise<{ data: Activity[]; meta: { total: number } }> => {
    try {
      const response = await api.get(`/activities?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all activities:', error);
      return { data: fallbackActivities, meta: { total: fallbackActivities.length } };
    }
  },

  /**
   * Get activities by role
   */
  getActivitiesByRole: async (role: string, limit: number = 10): Promise<Activity[]> => {
    try {
      const response = await api.get<Activity[]>(`/activities/by-role?role=${encodeURIComponent(role)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities by role:', error);
      return [];
    }
  },

  /**
   * Get notifications
   */
  getNotifications: async (limit: number = 10): Promise<Notification[]> => {
    // TODO: Replace with real API call when backend is ready
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
