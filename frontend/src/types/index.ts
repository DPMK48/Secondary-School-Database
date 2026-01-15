// User & Authentication Types
export type UserRole = 'admin' | 'form_teacher' | 'subject_teacher';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// Role Type
export interface Role {
  id: number;
  role_name: string;
}

// Teacher Types
export interface Teacher {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  staff_id?: string;
  address?: string;
  employment_date?: string;
  status?: string;
  subjects?: Subject[];
  classes?: Class[];
}

export interface TeacherSubjectClass {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
}

// Student Types
export type StudentStatus = 'Active' | 'Graduated' | 'Transferred' | 'Suspended';
export type Gender = 'Male' | 'Female';

export interface Student {
  id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  current_class_id: number;
  status: StudentStatus;
  current_class?: Class;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
}

// Class Types
export type ClassLevel = 'Junior' | 'Senior';
export type ClassArm = 'A' | 'B' | 'C' | 'D';

export interface Class {
  id: number;
  class_name: string;
  arm: ClassArm;
  level: ClassLevel;
  students_count?: number;
  form_teacher?: Teacher;
}

export interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
  class?: Class;
  subject?: Subject;
}

// Subject Types
export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  level?: ClassLevel;
}

// Academic Session & Term Types
export interface AcademicSession {
  id: number;
  session_name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

export interface Term {
  id: number;
  term_name: string;
  is_current: boolean;
}

// Assessment Types
export type AssessmentType = 'Test 1' | 'Test 2' | 'Test 3' | 'Exam';

export interface Assessment {
  id: number;
  name: AssessmentType;
  max_score: number;
}

// Result Types
export interface Result {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  session_id: number;
  term_id: number;
  assessment_id: number;
  score: number;
  student?: Student;
  subject?: Subject;
  class?: Class;
  teacher?: Teacher;
  session?: AcademicSession;
  term?: Term;
  assessment?: Assessment;
}

export interface StudentResultSummary {
  student_id: number;
  student: Student;
  subjects: SubjectScore[];
  total_score: number;
  average: number;
  grade: string;
  position: number;
  term: Term;
  session: AcademicSession;
  remarks?: string;
}

export interface SubjectScore {
  subject_id: number;
  subject_name: string;
  test1: number;
  test2: number;
  test3: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface ClassResultSummary {
  class_id: number;
  class: Class;
  term: Term;
  session: AcademicSession;
  students: StudentResultSummary[];
  class_average: number;
  highest_score: number;
  lowest_score: number;
  is_approved: boolean;
  is_locked: boolean;
}

// Attendance Types
export interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  session_id: number;
  term_id: number;
  days_present: number;
  days_absent: number;
  total_days: number;
  student?: Student;
}

// Form Teacher Types
export interface FormTeacher {
  id: number;
  teacher_id: number;
  class_id: number;
  session_id: number;
  teacher?: Teacher;
  class?: Class;
  session?: AcademicSession;
}

// Remarks
export interface Remark {
  id: number;
  student_id: number;
  class_id: number;
  term_id: number;
  session_id: number;
  form_teacher_remark?: string;
  admin_remark?: string;
  student?: Student;
}

// Grade Configuration
export interface GradeConfig {
  min_score: number;
  max_score: number;
  grade: string;
  remark: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  current_session: AcademicSession;
  current_term: Term;
  recent_activities: Activity[];
}

export interface Activity {
  id: number;
  action: string;
  description: string;
  user: string;
  timestamp: string;
}
