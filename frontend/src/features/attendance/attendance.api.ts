import api from '../../services/axios';
import type { Attendance, PaginatedResponse, ApiResponse } from '../../types';

export type AttendancePeriod = 'Morning' | 'Afternoon';

export interface AttendanceFilters {
  studentId?: number;
  classId?: number;
  date?: string;
  termId?: number;
  sessionId?: number;
  period?: AttendancePeriod;
  page?: number;
  perPage?: number;
}

export interface MarkAttendanceData {
  studentId: number;
  classId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  sessionId: number;
  termId: number;
  period?: AttendancePeriod;
  remarks?: string;
}

export interface BulkAttendanceData {
  classId: number;
  date: string;
  sessionId: number;
  termId: number;
  period?: AttendancePeriod;
  attendances: Array<{
    studentId: number;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
  }>;
}

export interface AttendanceStatusResponse {
  hasMorning: boolean;
  hasAfternoon: boolean;
  isComplete: boolean;
  nextPeriod: AttendancePeriod | null;
  morningCount: number;
  afternoonCount: number;
  morningPresent: number;
  morningAbsent: number;
  afternoonPresent: number;
  afternoonAbsent: number;
}

export const attendanceApi = {
  /**
   * Get all attendance records with optional filters
   */
  getAll: (filters?: AttendanceFilters) =>
    api.get<PaginatedResponse<Attendance>>('/attendance', { params: filters }),

  /**
   * Get single attendance record by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Attendance>>(`/attendance/${id}`),

  /**
   * Mark single student attendance
   */
  create: (data: MarkAttendanceData) =>
    api.post<ApiResponse<Attendance>>('/attendance', data),

  /**
   * Bulk mark attendance for multiple students
   */
  bulkCreate: (data: BulkAttendanceData) =>
    api.post<ApiResponse<Attendance[]>>('/attendance/bulk', data),

  /**
   * Update attendance record
   */
  update: (id: number, data: Partial<MarkAttendanceData>) =>
    api.put<ApiResponse<Attendance>>(`/attendance/${id}`, data),

  /**
   * Delete attendance record
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/attendance/${id}`),

  /**
   * Get student's attendance summary
   */
  getStudentSummary: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/attendance/student/${studentId}/summary`, { params }),

  /**
   * Get class attendance for a specific date
   */
  getClassByDate: (classId: number, date: string) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance/class/${classId}/date/${date}`),

  /**
   * Get class attendance summary
   */
  getClassSummary: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/attendance/class/${classId}/summary`, { params }),

  /**
   * Get attendance statistics
   */
  getStatistics: (params?: { class_id?: number; student_id?: number; term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>('/attendance/statistics', { params }),

  /**
   * Get attendance report for a date range
   */
  getReport: (params: { class_id?: number; start_date: string; end_date: string; term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>('/attendance/report', { params }),

  /**
   * Get attendance status for a class on a specific date (morning/afternoon completion)
   */
  getAttendanceStatus: (classId: number, date: string) =>
    api.get<ApiResponse<AttendanceStatusResponse>>(`/attendance/status/${classId}/${date}`),
};
