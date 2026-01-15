import api from '../../services/axios';
import type { Class, ClassSubject, Student, PaginatedResponse, ApiResponse } from '../../types';

export interface ClassFilters {
  level?: 'Junior' | 'Senior';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateClassData {
  class_name: string;
  arm: 'A' | 'B' | 'C' | 'D';
  level: 'Junior' | 'Senior';
  form_teacher_id?: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export const classesApi = {
  /**
   * Get all classes with optional filters
   */
  getAll: (filters?: ClassFilters) =>
    api.get<PaginatedResponse<Class>>('/classes', { params: filters }),

  /**
   * Get single class by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Class>>(`/classes/${id}`),

  /**
   * Create new class
   */
  create: (data: CreateClassData) =>
    api.post<ApiResponse<Class>>('/classes', data),

  /**
   * Update existing class
   */
  update: (id: number, data: UpdateClassData) =>
    api.put<ApiResponse<Class>>(`/classes/${id}`, data),

  /**
   * Delete class
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/classes/${id}`),

  /**
   * Get students in a class
   */
  getStudents: (id: number, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Student>>(`/classes/${id}/students`, { params }),

  /**
   * Get subjects for a class
   */
  getSubjects: (id: number) =>
    api.get<ApiResponse<ClassSubject[]>>(`/classes/${id}/subjects`),

  /**
   * Assign subject to class
   */
  assignSubject: (classId: number, subjectId: number) =>
    api.post<ApiResponse<ClassSubject>>(`/classes/${classId}/subjects`, { subject_id: subjectId }),

  /**
   * Remove subject from class
   */
  removeSubject: (classId: number, subjectId: number) =>
    api.delete<ApiResponse<void>>(`/classes/${classId}/subjects/${subjectId}`),

  /**
   * Get class results summary
   */
  getResultsSummary: (id: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/classes/${id}/results`, { params }),

  /**
   * Get class attendance summary
   */
  getAttendanceSummary: (id: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/classes/${id}/attendance`, { params }),
};
