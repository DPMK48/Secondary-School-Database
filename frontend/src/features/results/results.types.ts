// Feature-specific results types
import type { Student, Subject, Class } from '../../types';

export interface ResultFormData {
  student_id: number;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  session_id: number;
  term_id: number;
  assessment_id: number;
  score: number;
}

export interface BulkScoreEntry {
  class_id: number;
  subject_id: number;
  teacher_id: number;
  session_id: number;
  term_id: number;
  assessment_id: number;
  scores: Array<{
    student_id: number;
    score: number;
  }>;
}

export interface StudentResultDetail {
  student: Student;
  results: Array<{
    subject: Subject;
    test1: number;
    test2: number;
    test3: number;
    exam: number;
    total: number;
    average: number;
    grade: string;
    remark: string;
  }>;
  overall_total: number;
  overall_average: number;
  position: number;
  total_students: number;
  form_teacher_remark?: string;
  admin_remark?: string;
  is_approved: boolean;
  is_locked: boolean;
}

export interface ClassResultSummary {
  class: Class;
  term_id: number;
  session_id: number;
  total_students: number;
  students: Array<{
    student: Student;
    total_score: number;
    average: number;
    position: number;
  }>;
  subject_statistics: Array<{
    subject: Subject;
    highest_score: number;
    lowest_score: number;
    average_score: number;
    pass_rate: number;
  }>;
}

export interface ScoreEntryRow {
  student_id: number;
  student_name: string;
  admission_no: string;
  test1?: number;
  test2?: number;
  test3?: number;
  exam?: number;
  total?: number;
  average?: number;
  grade?: string;
}

export interface ResultApprovalData {
  class_id: number;
  term_id: number;
  session_id: number;
  approved_by: number;
  approval_date: string;
  remarks?: string;
}

export interface ResultLockData {
  class_id: number;
  term_id: number;
  session_id: number;
  locked_by: number;
  lock_date: string;
}

export interface ResultFilters {
  student_id?: number;
  class_id?: number;
  subject_id?: number;
  term_id?: number;
  session_id?: number;
  teacher_id?: number;
  assessment_id?: number;
  is_approved?: boolean;
  is_locked?: boolean;
}

export interface GradeCalculation {
  score: number;
  grade: string;
  remark: string;
}
