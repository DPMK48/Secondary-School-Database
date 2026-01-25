import { useAuth } from './useAuth';
import type { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../utils/constants';

export function useRole() {
  const { user, isAuthenticated, token } = useAuth();
  const role = user?.role as UserRole | undefined;

  const hasPermission = (permission: string): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  return {
    role,
    isAuthenticated,
    token,
    hasPermission,
    canAccess,
    isAdmin: role === 'Admin',
    isFormTeacher: role === 'Form Teacher',
    isSubjectTeacher: role === 'Subject Teacher',
    canManageUsers: hasPermission('manage_users'),
    canManageClasses: hasPermission('manage_classes'),
    canManageSubjects: hasPermission('manage_subjects'),
    canManageTeachers: hasPermission('manage_teachers'),
    canManageStudents: hasPermission('manage_students'),
    canViewAllResults: hasPermission('view_all_results'),
    canApproveResults: hasPermission('approve_results'),
    canLockResults: hasPermission('lock_results'),
    canEnterScores: hasPermission('enter_scores'),
    canAddRemarks: hasPermission('add_remarks'),
    canManageAttendance: hasPermission('manage_attendance'),
    canViewAttendance: hasPermission('view_attendance'),
    canPrintAttendance: hasPermission('print_attendance'),
    canViewReports: hasPermission('view_reports'),
    canExportReports: hasPermission('export_reports'),
  };
}

export default useRole;
