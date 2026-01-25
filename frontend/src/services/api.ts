import axiosInstance from './axios';
import type {
  Student,
  Teacher,
  Class,
  Subject,
  Result,
  Attendance,
  AcademicSession,
  Term,
  Assessment,
  ClassSubject,
  TeacherSubjectClass,
  FormTeacher,
  Remark,
  StudentResultSummary,
  ClassResultSummary,
  DashboardStats,
  PaginatedResponse,
} from '../types';

// Generic API functions
async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
}

async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.post<T>(url, data);
  return response.data;
}

async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.put<T>(url, data);
  return response.data;
}

async function del<T>(url: string): Promise<T> {
  const response = await axiosInstance.delete<T>(url);
  return response.data;
}

// Dashboard API
export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard/stats'),
};

// Students API
export const studentsApi = {
  getAll: (params?: { page?: number; perPage?: number; search?: string; class_id?: number }) =>
    get<PaginatedResponse<Student>>('/students', params),
  getById: (id: number) => get<Student>(`/students/${id}`),
  create: (data: Partial<Student>) => post<Student>('/students', data),
  update: (id: number, data: Partial<Student>) => put<Student>(`/students/${id}`, data),
  delete: (id: number) => del<void>(`/students/${id}`),
  getByClass: (classId: number) => get<Student[]>(`/students/class/${classId}`),
};

// Teachers API
export const teachersApi = {
  getAll: (params?: { page?: number; perPage?: number; search?: string }) =>
    get<PaginatedResponse<Teacher>>('/teachers', params),
  getById: (id: number) => get<Teacher>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => post<Teacher>('/teachers', data),
  update: (id: number, data: Partial<Teacher>) => put<Teacher>(`/teachers/${id}`, data),
  delete: (id: number) => del<void>(`/teachers/${id}`),
  getAssignments: (id: number) => get<TeacherSubjectClass[]>(`/teachers/${id}/assignments`),
};

// Classes API
export const classesApi = {
  getAll: (params?: { page?: number; perPage?: number; level?: string }) =>
    get<PaginatedResponse<Class>>('/classes', params),
  getById: (id: number) => get<Class>(`/classes/${id}`),
  create: (data: Partial<Class>) => post<Class>('/classes', data),
  update: (id: number, data: Partial<Class>) => put<Class>(`/classes/${id}`, data),
  delete: (id: number) => del<void>(`/classes/${id}`),
  getStudents: (id: number) => get<Student[]>(`/classes/${id}/students`),
  getSubjects: (id: number) => get<ClassSubject[]>(`/classes/${id}/subjects`),
};

// Subjects API
export const subjectsApi = {
  getAll: (params?: { page?: number; perPage?: number; search?: string }) =>
    get<PaginatedResponse<Subject>>('/subjects', params),
  getById: (id: number) => get<Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => post<Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => put<Subject>(`/subjects/${id}`, data),
  delete: (id: number) => del<void>(`/subjects/${id}`),
};

// Class-Subjects API
export const classSubjectsApi = {
  getAll: () => get<ClassSubject[]>('/class-subjects'),
  assign: (data: { class_id: number; subject_id: number }) =>
    post<ClassSubject>('/class-subjects', data),
  remove: (id: number) => del<void>(`/class-subjects/${id}`),
};

// Teaching Assignments API
export const teachingAssignmentsApi = {
  getAll: () => get<TeacherSubjectClass[]>('/teaching-assignments'),
  assign: (data: { teacher_id: number; subject_id: number; class_id: number }) =>
    post<TeacherSubjectClass>('/teaching-assignments', data),
  remove: (id: number) => del<void>(`/teaching-assignments/${id}`),
};

// Form Teachers API
export const formTeachersApi = {
  getAll: () => get<FormTeacher[]>('/form-teachers'),
  assign: (data: { teacher_id: number; class_id: number; session_id: number }) =>
    post<FormTeacher>('/form-teachers', data),
  remove: (id: number) => del<void>(`/form-teachers/${id}`),
};

// Sessions API
export const sessionsApi = {
  getAll: () => get<AcademicSession[]>('/sessions'),
  getCurrent: () => get<AcademicSession>('/sessions/current'),
  create: (data: Partial<AcademicSession>) => post<AcademicSession>('/sessions', data),
  update: (id: number, data: Partial<AcademicSession>) =>
    put<AcademicSession>(`/sessions/${id}`, data),
  setCurrent: (id: number) => post<void>(`/sessions/${id}/set-current`),
};

// Terms API
export const termsApi = {
  getAll: () => get<Term[]>('/terms'),
  getCurrent: () => get<Term>('/terms/current'),
  setCurrent: (id: number) => post<void>(`/terms/${id}/set-current`),
};

// Assessments API
export const assessmentsApi = {
  getAll: () => get<Assessment[]>('/assessments'),
  getById: (id: number) => get<Assessment>(`/assessments/${id}`),
  create: (data: Partial<Assessment>) => post<Assessment>('/assessments', data),
};

// Results API
export const resultsApi = {
  getAll: (params?: {
    class_id?: number;
    subject_id?: number;
    term_id?: number;
    session_id?: number;
  }) => get<Result[]>('/results', params),
  create: (data: {
    student_id: number;
    subject_id: number;
    assessment_id: number;
    score: number;
    term_id: number;
    session_id: number;
  }) => post<Result>('/results', data),
  update: (id: number, data: { score: number }) => put<Result>(`/results/${id}`, data),
  bulkCreate: (data: Array<{
    student_id: number;
    subject_id: number;
    assessment_id: number;
    score: number;
    term_id: number;
    session_id: number;
  }>) => post<Result[]>('/results/bulk', data),
  getByStudent: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    get<StudentResultSummary>(`/results/student/${studentId}`, params),
  getByClass: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    get<ClassResultSummary>(`/results/class/${classId}`, params),
  getSummaryByStudent: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    get<StudentResultSummary>(`/results/summary/student/${studentId}`, params),
  getSummaryByClass: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    get<ClassResultSummary>(`/results/summary/class/${classId}`, params),
  approveClass: (classId: number, params: { term_id: number; session_id: number }) =>
    post<void>(`/results/approve/class/${classId}`, params),
  lockClass: (classId: number, params: { term_id: number; session_id: number }) =>
    post<void>(`/results/lock/class/${classId}`, params),
};

// Remarks API
export const remarksApi = {
  getByStudent: (studentId: number, params?: { term_id?: number; session_id?: number }) =>
    get<Remark>(`/remarks/student/${studentId}`, params),
  create: (data: {
    student_id: number;
    class_id: number;
    term_id: number;
    session_id: number;
    form_teacher_remark?: string;
    admin_remark?: string;
  }) => post<Remark>('/remarks', data),
  update: (id: number, data: Partial<Remark>) => put<Remark>(`/remarks/${id}`, data),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: { class_id?: number; term_id?: number; session_id?: number }) =>
    get<Attendance[]>('/attendance', params),
  getByClass: (classId: number, params?: { term_id?: number; session_id?: number }) =>
    get<Attendance[]>(`/attendance/class/${classId}`, params),
  create: (data: {
    student_id: number;
    class_id: number;
    session_id: number;
    term_id: number;
    days_present: number;
    days_absent: number;
  }) => post<Attendance>('/attendance', data),
  update: (id: number, data: Partial<Attendance>) => put<Attendance>(`/attendance/${id}`, data),
  bulkCreate: (data: Array<{
    student_id: number;
    class_id: number;
    session_id: number;
    term_id: number;
    days_present: number;
    days_absent: number;
  }>) => post<Attendance[]>('/attendance/bulk', data),
};

// Reports API
export const reportsApi = {
  getStudentPdf: (studentId: number, params: { term_id: number; session_id: number }) =>
    get<Blob>(`/reports/student/${studentId}/pdf`, { ...params, responseType: 'blob' }),
  getClassPdf: (classId: number, params: { term_id: number; session_id: number }) =>
    get<Blob>(`/reports/class/${classId}/pdf`, { ...params, responseType: 'blob' }),
};

export default {
  dashboard: dashboardApi,
  students: studentsApi,
  teachers: teachersApi,
  classes: classesApi,
  subjects: subjectsApi,
  classSubjects: classSubjectsApi,
  teachingAssignments: teachingAssignmentsApi,
  formTeachers: formTeachersApi,
  sessions: sessionsApi,
  terms: termsApi,
  assessments: assessmentsApi,
  results: resultsApi,
  remarks: remarksApi,
  attendance: attendanceApi,
  reports: reportsApi,
};
