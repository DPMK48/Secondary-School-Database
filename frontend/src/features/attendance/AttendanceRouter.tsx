import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AttendanceHub from './AttendanceHub';
import AttendanceEntry from './AttendanceEntry';

/**
 * Attendance Router Component
 * Routes to different attendance views based on user role:
 * - Admin: AttendanceHub (overview with all options)
 * - Form Teacher: AttendanceEntry (direct to marking for their class)
 */
const AttendanceRouter: React.FC = () => {
  const { user } = useAuth();

  // Form teachers go directly to attendance entry for their class
  if (user?.role === 'Form Teacher') {
    return <AttendanceEntry />;
  }

  // Admin gets the full attendance hub
  return <AttendanceHub />;
};

export default AttendanceRouter;
