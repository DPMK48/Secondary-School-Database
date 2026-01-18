import type { Subject, ClassLevel, Teacher, Class } from '../../types';

export interface SubjectWithDetails extends Subject {
  teachers?: Teacher[];
  classes?: Class[];
  teacher_count?: number;
  class_count?: number;
}

export interface CreateSubjectData {
  subject_name: string;
  subject_code: string;
  level?: ClassLevel;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export interface SubjectFilters {
  level?: ClassLevel;
  search?: string;
}
