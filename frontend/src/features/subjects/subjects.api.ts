import api from '../../services/axios';
import type { Subject, PaginatedResponse, ApiResponse } from '../../types';

export interface SubjectFilters {
  level?: 'Junior' | 'Senior';
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateSubjectData {
  subjectName: string;
  subjectCode: string;
  level?: 'Junior' | 'Senior';
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export const subjectsApi = {
  /**
   * Get all subjects with optional filters
   */
  getAll: async (filters?: SubjectFilters) => {
    // Clean up filters - remove empty/undefined values
    const params: any = {};
    if (filters?.level && filters.level !== '') {
      params.level = filters.level;
    }
    if (filters?.search && filters.search.trim() !== '') {
      params.search = filters.search;
    }
    if (filters?.page) {
      params.page = filters.page;
    }
    if (filters?.perPage) {
      params.perPage = filters.perPage;
    }
    
    const response = await api.get<any>('/subjects', { params });
    return response.data;
  },

  /**
   * Get single subject by ID
   */
  getById: async (id: number) => {
    const response = await api.get<any>(`/subjects/${id}`);
    return response.data;
  },

  /**
   * Create new subject
   */
  create: async (data: CreateSubjectData) => {
    const response = await api.post<any>('/subjects', data);
    return response.data;
  },

  /**
   * Update existing subject
   */
  update: async (id: number, data: UpdateSubjectData) => {
    const response = await api.patch<any>(`/subjects/${id}`, data);
    return response.data;
  },

  /**
   * Delete subject
   */
  delete: async (id: number) => {
    const response = await api.delete<any>(`/subjects/${id}`);
    return response.data;
  },

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
