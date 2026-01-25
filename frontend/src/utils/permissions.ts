import type { UserRole } from '../types';
import { ROLE_PERMISSIONS } from './constants';

export function canAccess(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.includes(permission) ?? false;
}

export function canManageUsers(role: UserRole): boolean {
  return canAccess(role, 'manage_users');
}

export function canManageClasses(role: UserRole): boolean {
  return canAccess(role, 'manage_classes');
}

export function canManageSubjects(role: UserRole): boolean {
  return canAccess(role, 'manage_subjects');
}

export function canManageTeachers(role: UserRole): boolean {
  return canAccess(role, 'manage_teachers');
}

export function canManageStudents(role: UserRole): boolean {
  return canAccess(role, 'manage_students');
}

export function canViewAllResults(role: UserRole): boolean {
  return canAccess(role, 'view_all_results');
}

export function canApproveResults(role: UserRole): boolean {
  return canAccess(role, 'approve_results');
}

export function canLockResults(role: UserRole): boolean {
  return canAccess(role, 'lock_results');
}

export function canEnterScores(role: UserRole): boolean {
  return canAccess(role, 'enter_scores');
}

export function canAddRemarks(role: UserRole): boolean {
  return canAccess(role, 'add_remarks');
}

export function canManageAttendance(role: UserRole): boolean {
  return canAccess(role, 'manage_attendance');
}

export function canViewAttendance(role: UserRole): boolean {
  return canAccess(role, 'view_attendance');
}

export function canPrintAttendance(role: UserRole): boolean {
  return canAccess(role, 'print_attendance');
}

export function canViewReports(role: UserRole): boolean {
  return canAccess(role, 'view_reports');
}

export function canExportReports(role: UserRole): boolean {
  return canAccess(role, 'export_reports');
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    Admin: 'Administrator',
    'Form Teacher': 'Form Teacher',
    'Subject Teacher': 'Subject Teacher',
  };
  return roleNames[role] || role;
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    Admin: 'bg-purple-100 text-purple-800',
    'Form Teacher': 'bg-green-100 text-green-800',
    'Subject Teacher': 'bg-yellow-100 text-yellow-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
