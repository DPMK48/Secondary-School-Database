import type { GradeConfig, UserRole } from '../types';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Application Constants
export const APP_NAME = 'Armburu Model School';
export const APP_DESCRIPTION = 'School Management System';

// Grade Configuration
export const GRADE_CONFIG: GradeConfig[] = [
  { min_score: 70, max_score: 100, grade: 'A', remark: 'Excellent' },
  { min_score: 60, max_score: 69, grade: 'B', remark: 'Very Good' },
  { min_score: 50, max_score: 59, grade: 'C', remark: 'Good' },
  { min_score: 45, max_score: 49, grade: 'D', remark: 'Fair' },
  { min_score: 40, max_score: 44, grade: 'E', remark: 'Pass' },
  { min_score: 0, max_score: 39, grade: 'F', remark: 'Fail' },
];

// Assessment Configuration (Test 1/2/3: 10 marks each, Exam: 70 marks = Total 100)
export const ASSESSMENT_TYPES = {
  TEST1: { id: 1, name: '1st Test', max_score: 10 },
  TEST2: { id: 2, name: '2nd Test', max_score: 10 },
  TEST3: { id: 3, name: '3rd Test', max_score: 10 },
  EXAM: { id: 4, name: 'Exam', max_score: 70 },
};

// Role Permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Admin: [
    'manage_users',
    'manage_classes',
    'manage_subjects',
    'manage_teachers',
    'manage_students',
    'view_all_results',
    'approve_results',
    'lock_results',
    'manage_sessions',
    'view_attendance',
    'print_attendance',
    'view_reports',
    'export_reports',
    'view_all_classes',
    'add_remarks',
  ],
  'Form Teacher': [
    'view_class_students',
    'view_class_results',
    'view_subject_teacher_results',
    'compile_results',
    'add_remarks',
    'view_reports',
    'manage_attendance',
    'view_attendance',
  ],
  'Subject Teacher': [
    'enter_scores',
    'view_assigned_classes',
    'view_assigned_subjects',
  ],
};

// Navigation Items by Role
export const NAV_ITEMS = {
  Admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Students', path: '/dashboard/students', icon: 'Users' },
    { label: 'Teachers', path: '/dashboard/teachers', icon: 'GraduationCap' },
    { label: 'Classes', path: '/dashboard/classes', icon: 'School' },
    { label: 'Subjects', path: '/dashboard/subjects', icon: 'BookOpen' },
    { label: 'Results', path: '/dashboard/results', icon: 'ClipboardList' },
    { label: 'Attendance', path: '/dashboard/attendance', icon: 'CalendarCheck' },
    { label: 'Reports', path: '/dashboard/reports', icon: 'FileText' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
  'Form Teacher': [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Class', path: '/dashboard/classes', icon: 'School' },
    { label: 'Attendance', path: '/dashboard/attendance', icon: 'CalendarCheck' },
    { label: 'Results', path: '/dashboard/results', icon: 'ClipboardList' },
    { label: 'Reports', path: '/dashboard/reports', icon: 'FileText' },
  ],
  'Subject Teacher': [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Subjects', path: '/dashboard/my-subjects', icon: 'BookOpen' },
    { label: 'Score Entry', path: '/dashboard/results/entry', icon: 'Edit' },
  ],
};

// Class Levels
export const CLASS_LEVELS = ['Junior', 'Senior'] as const;

// Class Arms
export const CLASS_ARMS = ['A', 'B', 'C', 'D'] as const;

// Student Statuses
export const STUDENT_STATUSES = ['Active', 'Graduated', 'Transferred', 'Suspended'] as const;

// Gender Options
export const GENDER_OPTIONS = ['Male', 'Female'] as const;

// Terms
export const TERMS = [
  { id: 1, name: 'First Term' },
  { id: 2, name: 'Second Term' },
  { id: 3, name: 'Third Term' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD MMM, YYYY';

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  ORIGINAL_USER: 'original_user_data',
  THEME: 'app_theme',
};

// Status Colors
export const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-800',
  Graduated: 'bg-blue-100 text-blue-800',
  Transferred: 'bg-yellow-100 text-yellow-800',
  Suspended: 'bg-red-100 text-red-800',
};

// Grade Colors
export const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-cyan-100 text-cyan-800',
  D: 'bg-yellow-100 text-yellow-800',
  E: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
};

// Current Session and Term
export const CURRENT_SESSION = '2023/2024';
export const CURRENT_TERM = 'First Term';
export const SESSIONS = ['2021/2022', '2022/2023', '2023/2024', '2024/2025'];

// App Configuration
export const APP_CONFIG = {
  schoolName: 'Armburu Model School',
  schoolMotto: 'Knowledge is Power',
  address: 'Bauchi, Nigeria',
};
