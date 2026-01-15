import api from '../../services/axios';
import type { Teacher, TeacherSubjectClass, PaginatedResponse, ApiResponse } from '../../types';

export interface TeacherFilters {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateTeacherData {
  user_id: number;
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
  teacher_id: number;
  subject_id: number;
  class_id: number;
}

export const teachersApi = {
  /**
   * Get all teachers with optional filters
   */
  getAll: (filters?: TeacherFilters) =>
    api.get<PaginatedResponse<Teacher>>('/teachers', { params: filters }),

  /**
   * Get single teacher by ID
   */
  getById: (id: number) =>
    api.get<ApiResponse<Teacher>>(`/teachers/${id}`),

  /**
   * Create new teacher
   */
  create: (data: CreateTeacherData) =>
    api.post<ApiResponse<Teacher>>('/teachers', data),

  /**
   * Update existing teacher
   */
  update: (id: number, data: UpdateTeacherData) =>
    api.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),

  /**
   * Delete teacher
   */
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/teachers/${id}`),

  /**
   * Get teacher's assigned subjects
   */
  getSubjects: (id: number) =>
    api.get<ApiResponse<TeacherSubjectClass[]>>(`/teachers/${id}/subjects`),

  /**
   * Get teacher's assigned classes
   */
  getClasses: (id: number) =>
    api.get<ApiResponse<TeacherSubjectClass[]>>(`/teachers/${id}/classes`),

  /**
   * Assign subject and class to teacher
   */
  assignSubjectClass: (data: AssignSubjectClassData) =>
    api.post<ApiResponse<TeacherSubjectClass>>('/teachers/assign', data),

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
};
