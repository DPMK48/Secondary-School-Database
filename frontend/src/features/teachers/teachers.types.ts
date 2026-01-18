import type { Teacher, Subject, Class, User } from '../../types';

export interface TeacherWithDetails extends Teacher {
  user?: User;
  subjects?: Subject[];
  classes?: Class[];
  assigned_subjects_count?: number;
  assigned_classes_count?: number;
}

export interface CreateTeacherData {
  user_id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  staff_id?: string;
  address?: string;
  employment_date?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {}

export interface TeacherFilters {
  status?: string;
  search?: string;
  subject_id?: number;
  class_id?: number;
}

export interface AssignSubjectData {
  teacher_id: number;
  subject_id: number;
  class_id: number;
}

export interface TeacherSubjectAssignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
}
