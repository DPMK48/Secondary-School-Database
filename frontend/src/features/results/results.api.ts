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
  perPage?: number;
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

  /**
   * Get compiled results for form teacher (all subjects for a class)
   */
  getFormTeacherCompilation: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/results/form-teacher/${classId}`, { 
      params: {
        termId: params?.term_id,
        sessionId: params?.session_id,
      }
    }),

  /**
   * Get student's all subject scores (for form teacher view)
   */
  getStudentAllSubjects: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/results/student/${studentId}/all-subjects`, { params }),

  /**
   * Bulk save scores for subject teacher - saves all assessment types
   * Makes separate API calls for each assessment type (test1, test2, test3, exam)
   */
  bulkSaveSubjectScores: async (data: {
    class_id: number;
    subject_id: number;
    teacher_id: number;
    session_id: number;
    term_id: number;
    scores: Array<{
      student_id: number;
      test1?: number;
      test2?: number;
      test3?: number;
      exam?: number;
    }>;
  }) => {
    const results = [];
    
    // Assessment mapping: test1=1, test2=2, test3=3, exam=4
    const assessmentTypes = [
      { key: 'test1', id: 1 },
      { key: 'test2', id: 2 },
      { key: 'test3', id: 3 },
      { key: 'exam', id: 4 },
    ];

    for (const assessment of assessmentTypes) {
      const scoresForAssessment = data.scores
        .filter(s => (s as any)[assessment.key] !== undefined)
        .map(s => ({
          studentId: s.student_id,
          score: (s as any)[assessment.key],
        }));

      if (scoresForAssessment.length > 0) {
        const response = await api.post('/results/bulk', {
          subjectId: data.subject_id,
          classId: data.class_id,
          teacherId: data.teacher_id,
          sessionId: data.session_id,
          termId: data.term_id,
          assessmentId: assessment.id,
          scores: scoresForAssessment,
        });
        results.push(response.data);
      }
    }

    return { data: results };
  },

  /**
   * Get subject teacher's assigned classes and subjects
   */
  getSubjectTeacherAssignments: (teacherId: number) =>
    api.get<ApiResponse<any>>(`/results/subject-teacher/${teacherId}/assignments`),

  /**
   * Calculate and get student average
   */
  calculateStudentAverage: (studentId: number, params: { class_id: number; term_id: number; session_id: number }) =>
    api.get<ApiResponse<{ average: number; total: number; subjects_count: number; grade: string }>>(`/results/student/${studentId}/average`, { params }),
};
