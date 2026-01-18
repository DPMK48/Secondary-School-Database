import type { Class, ClassLevel, ClassArm, Teacher, Student, Subject } from '../../types';

export interface ClassWithDetails extends Class {
  form_teacher?: Teacher;
  students?: Student[];
  students_count?: number;
  subjects?: Subject[];
}

export interface CreateClassData {
  class_name: string;
  arm: ClassArm;
  level: ClassLevel;
  form_teacher_id?: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export interface ClassFilters {
  level?: ClassLevel;
  arm?: ClassArm;
  search?: string;
}

export interface AssignFormTeacherData {
  class_id: number;
  teacher_id: number;
}
