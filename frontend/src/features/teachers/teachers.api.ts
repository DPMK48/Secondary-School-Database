import api from '../../services/axios';
import type { Teacher, TeacherSubjectClass, PaginatedResponse, ApiResponse } from '../../types';

export interface TeacherFilters {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateTeacherData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  staff_id?: string;
  address?: string;
  employment_date?: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  status?: string;
}

export interface AssignSubjectClassData {
  teacherId: number;
  subjectId: number;
  classId: number;
}

export const teachersApi = {
  /**
   * Get all teachers with optional filters
   */
  getAll: async (filters?: TeacherFilters) => {
    const response = await api.get<any>('/teachers', { params: filters });
    return response.data;
  },

  /**
   * Get single teacher by ID
   */
  getById: async (id: number) => {
    const response = await api.get<any>(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Create new teacher
   */
  create: async (data: CreateTeacherData) => {
    const response = await api.post<any>('/teachers', data);
    return response.data;
  },

  /**
   * Update existing teacher
   */
  update: async (id: number, data: UpdateTeacherData) => {
    const response = await api.patch<any>(`/teachers/${id}`, data);
    return response.data;
  },

  /**
   * Delete teacher
   */
  delete: async (id: number) => {
    const response = await api.delete<any>(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Get teacher's assigned subjects
   */
  getSubjects: async (id: number) => {
    const response = await api.get<any>(`/teachers/${id}/subjects`);
    return response.data;
  },

  /**
   * Get teacher's assigned classes
   */
  getClasses: async (id: number) => {
    const response = await api.get<any>(`/teachers/${id}/classes`);
    return response.data;
  },

  /**
   * Assign subject and class to teacher
   */
  assignSubjectClass: async (data: AssignSubjectClassData) => {
    const response = await api.post<any>('/teachers/assign', data);
    return response.data;
  },

  /**
   * Remove subject-class assignment from teacher
   */
  removeAssignment: (assignmentId: number) =>
    api.delete<ApiResponse<void>>(`/teachers/assign/${assignmentId}`),

  /**
   * Get teachers by subject
   */
  getBySubject: (subjectId: number) =>
    api.get<ApiResponse<Teacher[]>>(`/teachers/subject/${subjectId}`),

  /**
   * Get teachers by class
   */
  getByClass: (classId: number) =>
    api.get<ApiResponse<Teacher[]>>(`/teachers/class/${classId}`),

  /**
   * Reset teacher password
   * Uses the user_id from the teacher record
   */
  resetPassword: async (userId: number) => {
    const response = await api.post<{ newPassword: string }>(`/users/${userId}/reset-password`);
    return response.data;
  },
};
