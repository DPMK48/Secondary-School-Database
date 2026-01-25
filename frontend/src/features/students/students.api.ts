import api from '../../services/axios';
import type { Student, PaginatedResponse, ApiResponse } from '../../types';

export interface StudentFilters {
  class_id?: number;
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateStudentData {
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  current_class_id: number;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  status?: 'Active' | 'Graduated' | 'Transferred' | 'Suspended';
}

export const studentsApi = {
  /**
   * Get all students with optional filters
   */
  getAll: async (filters?: StudentFilters) => {
    const response = await api.get<any>('/students', { params: filters });
    return response.data; // Backend returns { success, data: [...], meta: {...} }
  },

  /**
   * Get single student by ID
   */
  getById: async (id: number) => {
    const response = await api.get<any>(`/students/${id}`);
    return response.data; // Backend returns { success, data: {...}, message }
  },

  /**
   * Create new student
   */
  create: async (data: CreateStudentData) => {
    const response = await api.post<any>('/students', data);
    return response.data;
  },

  /**
   * Update existing student
   */
  update: async (id: number, data: UpdateStudentData) => {
    const response = await api.patch<any>(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Delete student
   */
  delete: async (id: number) => {
    const response = await api.delete<any>(`/students/${id}`);
    return response.data;
  },

  /**
   * Get student's results
   */
  getResults: async (id: number, params?: { term_id?: number; session_id?: number }) => {
    const response = await api.get<any>(`/students/${id}/results`, { params });
    return response.data;
  },

  /**
   * Get student's attendance
   */
  getAttendance: async (id: number, params?: { term_id?: number; session_id?: number }) => {
    const response = await api.get<any>(`/students/${id}/attendance`, { params });
    return response.data;
  },
};
