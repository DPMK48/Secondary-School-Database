import api from '../../services/axios';
import type { Result, StudentResultSummary, PaginatedResponse, ApiResponse } from '../../types';

export interface ResultFilters {
  student_id?: number;
  class_id?: number;
  subject_id?: number;
  term_id?: number;
  session_id?: number;
  teacher_id?: number;
  page?: number;
  per_page?: number;
}

export interface ScoreEntryData {
  student_id: number;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  session_id: number;
  term_id: number;
  assessment_id: number;
  score: number;
}

export interface BulkScoreEntryData {
  class_id: number;
  subject_id: number;
  teacher_id: number;
  session_id: number;
  term_id: number;
  assessment_id: number;
  scores: Array<{
    student_id: number;
    score: number;
  }>;
}

export interface ApproveResultsData {
  class_id: number;
  term_id: number;
  session_id: number;
  approved_by: number;
}

export interface LockResultsData {
  class_id: number;
  term_id: number;
  session_id: number;
  locked_by: number;
}

export const resultsApi = {
  /**
   * Get all results with optional filters
   */
  getAll: (filters?: ResultFilters) =>
    api.get<PaginatedResponse<Result>>('/results', { params: filters }),

  /**
   * Get single result by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Result>>(`/results/${id}`),

  /**
   * Create/Enter a single score
   */
  create: (data: ScoreEntryData) =>
    api.post<ApiResponse<Result>>('/results', data),

  /**
   * Bulk score entry for multiple students
   */
  bulkCreate: (data: BulkScoreEntryData) =>
    api.post<ApiResponse<Result[]>>('/results/bulk', data),

  /**
   * Update existing result
   */
  update: (id: number, data: Partial<ScoreEntryData>) =>
    api.put<ApiResponse<Result>>(`/results/${id}`, data),

  /**
   * Delete result
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/results/${id}`),

  /**
   * Get student's result summary
   */
  getStudentSummary: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<StudentResultSummary>>(`/results/student/${studentId}/summary`, { params }),

  /**
   * Get class result summary
   */
  getClassSummary: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/results/class/${classId}/summary`, { params }),

  /**
   * Get subject results for a class
   */
  getClassSubjectResults: (classId: number, subjectId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<Result[]>>(`/results/class/${classId}/subject/${subjectId}`, { params }),

  /**
   * Get teacher's assigned results (for score entry)
   */
  getTeacherResults: (teacherId: number, params?: { class_id?: number; subject_id?: number; term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<Result[]>>(`/results/teacher/${teacherId}`, { params }),

  /**
   * Approve class results
   */
  approveResults: (data: ApproveResultsData) =>
    api.post<ApiResponse<any>>('/results/approve', data),

  /**
   * Lock class results (prevent further modifications)
   */
  lockResults: (data: LockResultsData) =>
    api.post<ApiResponse<any>>('/results/lock', data),

  /**
   * Check if results are locked
   */
  checkLocked: (params: { class_id: number; term_id: number; session_id: number }) =>
    api.get<ApiResponse<{ is_locked: boolean }>>('/results/locked', { params }),

  /**
   * Get result statistics
   */
  getStatistics: (params?: { class_id?: number; subject_id?: number; term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>('/results/statistics', { params }),
};
