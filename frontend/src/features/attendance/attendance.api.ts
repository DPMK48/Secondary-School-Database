import api from '../../services/axios';
import type { Attendance, PaginatedResponse, ApiResponse } from '../../types';

export interface AttendanceFilters {
  studentId?: number;
  classId?: number;
  date?: string;
  termId?: number;
  sessionId?: number;
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
  remarks?: string;
}

export interface BulkAttendanceData {
  classId: number;
  date: string;
  sessionId: number;
  termId: number;
  attendances: Array<{
    studentId: number;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
  }>;
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
};
