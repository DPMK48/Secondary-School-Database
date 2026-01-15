import api from '../../services/axios';
import type { ApiResponse } from '../../types';

export interface ReportFilters {
  term_id?: number;
  session_id?: number;
  format?: 'pdf' | 'excel' | 'json';
}

export interface StudentReportParams extends ReportFilters {
  student_id: number;
}

export interface ClassReportParams extends ReportFilters {
  class_id: number;
}

export interface SubjectReportParams extends ReportFilters {
  subject_id: number;
  class_id?: number;
}

export interface AttendanceReportParams {
  class_id?: number;
  student_id?: number;
  start_date: string;
  end_date: string;
  term_id?: number;
  session_id?: number;
  format?: 'pdf' | 'excel' | 'json';
}

export const reportsApi = {
  /**
   * Generate student report card
   */
  getStudentReport: (params: StudentReportParams) =>
    api.get<ApiResponse<any>>('/reports/student', { params }),

  /**
   * Generate class report
   */
  getClassReport: (params: ClassReportParams) =>
    api.get<ApiResponse<any>>('/reports/class', { params }),

  /**
   * Generate subject performance report
   */
  getSubjectReport: (params: SubjectReportParams) =>
    api.get<ApiResponse<any>>('/reports/subject', { params }),

  /**
   * Generate attendance report
   */
  getAttendanceReport: (params: AttendanceReportParams) =>
    api.get<ApiResponse<any>>('/reports/attendance', { params }),

  /**
   * Generate overall academic performance report
   */
  getAcademicPerformance: (params?: ReportFilters) =>
    api.get<ApiResponse<any>>('/reports/academic-performance', { params }),

  /**
   * Generate teacher performance report
   */
  getTeacherPerformance: (teacherId: number, params?: ReportFilters) =>
    api.get<ApiResponse<any>>(`/reports/teacher/${teacherId}`, { params }),

  /**
   * Generate term summary report
   */
  getTermSummary: (params: ReportFilters) =>
    api.get<ApiResponse<any>>('/reports/term-summary', { params }),

  /**
   * Export report as PDF
   */
  exportPDF: (reportType: string, params: any) =>
    api.get(`/reports/${reportType}/pdf`, { 
      params, 
      responseType: 'blob' 
    }),

  /**
   * Export report as Excel
   */
  exportExcel: (reportType: string, params: any) =>
    api.get(`/reports/${reportType}/excel`, { 
      params, 
      responseType: 'blob' 
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: (params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>('/reports/dashboard-stats', { params }),
};
