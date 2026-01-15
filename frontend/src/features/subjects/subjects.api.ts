import api from '../../services/axios';
import type { Subject, PaginatedResponse, ApiResponse } from '../../types';

export interface SubjectFilters {
  level?: 'Junior' | 'Senior';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateSubjectData {
  subject_name: string;
  subject_code: string;
  level?: 'Junior' | 'Senior';
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export const subjectsApi = {
  /**
   * Get all subjects with optional filters
   */
  getAll: (filters?: SubjectFilters) =>
    api.get<PaginatedResponse<Subject>>('/subjects', { params: filters }),

  /**
   * Get single subject by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Subject>>(`/subjects/${id}`),

  /**
   * Create new subject
   */
  create: (data: CreateSubjectData) =>
    api.post<ApiResponse<Subject>>('/subjects', data),

  /**
   * Update existing subject
   */
  update: (id: number, data: UpdateSubjectData) =>
    api.put<ApiResponse<Subject>>(`/subjects/${id}`, data),

  /**
   * Delete subject
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/subjects/${id}`),

  /**
   * Get teachers teaching this subject
   */
  getTeachers: (id: number) =>
    api.get<ApiResponse<any>>(`/subjects/${id}/teachers`),

  /**
   * Get classes taking this subject
   */
  getClasses: (id: number) =>
    api.get<ApiResponse<any>>(`/subjects/${id}/classes`),
};
