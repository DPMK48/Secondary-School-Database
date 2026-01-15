import api from '../../services/axios';
import type { Student, PaginatedResponse, ApiResponse } from '../../types';

export interface StudentFilters {
  class_id?: number;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
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
  getAll: (filters?: StudentFilters) =>
    api.get<PaginatedResponse<Student>>('/students', { params: filters }),

  /**
   * Get single student by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Student>>(`/students/${id}`),

  /**
   * Create new student
   */
  create: (data: CreateStudentData) =>
    api.post<ApiResponse<Student>>('/students', data),

  /**
   * Update existing student
   */
  update: (id: number, data: UpdateStudentData) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),

  /**
   * Delete student
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/students/${id}`),

  /**
   * Get student's results
   */
  getResults: (id: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/students/${id}/results`, { params }),

  /**
   * Get student's attendance
   */
  getAttendance: (id: number, params?: { term_id?: number; session_id?: number }) =>
    api.get<ApiResponse<any>>(`/students/${id}/attendance`, { params }),
};
