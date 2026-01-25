import api from '../../services/axios';
import type { Class, ClassSubject, Student, PaginatedResponse, ApiResponse } from '../../types';

export interface ClassFilters {
  level?: 'Junior' | 'Senior';
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateClassData {
  className: string;
  arm: 'A' | 'B' | 'C' | 'D';
  level: 'Junior' | 'Senior';
  formTeacherId?: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export const classesApi = {
  /**
   * Get all classes with optional filters
   */
  getAll: async (filters?: ClassFilters) => {
    const response = await api.get<any>('/classes', { params: filters });
    return response.data;
  },

  /**
   * Get single class by ID
   */
  getById: async (id: number) => {
    const response = await api.get<any>(`/classes/${id}`);
    return response.data;
  },

  /**
   * Create new class
   */
  create: async (data: CreateClassData) => {
    const response = await api.post<any>('/classes', data);
    return response.data;
  },

  /**
   * Update existing class
   */
  update: async (id: number, data: UpdateClassData) => {
    const response = await api.patch<any>(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Delete class
   */
  delete: async (id: number) => {
    const response = await api.delete<any>(`/classes/${id}`);
    return response.data;
  },

  /**
   * Get students in a class
   */
  getStudents: async (id: number, params?: { page?: number; perPage?: number }) => {
    const response = await api.get<any>(`/classes/${id}/students`, { params });
    return response.data;
  },

  /**
   * Get subjects for a class
   */
  getSubjects: async (id: number) => {
    const response = await api.get<any>(`/classes/${id}/subjects`);
    return response.data;
  },

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
