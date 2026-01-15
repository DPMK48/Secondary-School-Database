import type {
  Student,
  Teacher,
  Class,
  Subject,
  AcademicSession,
  Term,
  Assessment,
  Result,
  TeacherSubjectClass,
  FormTeacher,
  DashboardStats,
  StudentResultSummary,
} from '../types';
import { calculateGrade } from './helpers';

// Mock Academic Sessions
export const mockSessions: AcademicSession[] = [
  { id: 1, session_name: '2023/2024', is_current: false, start_date: '2023-09-01', end_date: '2024-07-31' },
  { id: 2, session_name: '2024/2025', is_current: true, start_date: '2024-09-01', end_date: '2025-07-31' },
];

// Mock Terms
export const mockTerms: Term[] = [
  { id: 1, term_name: 'First Term', is_current: true },
  { id: 2, term_name: 'Second Term', is_current: false },
  { id: 3, term_name: 'Third Term', is_current: false },
];

// Mock Assessments
export const mockAssessments: Assessment[] = [
  { id: 1, name: 'Test 1', max_score: 10 },
  { id: 2, name: 'Test 2', max_score: 10 },
  { id: 3, name: 'Test 3', max_score: 10 },
  { id: 4, name: 'Exam', max_score: 70 },
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  { id: 1, subject_name: 'Mathematics', subject_code: 'MTH', level: 'Junior' },
  { id: 2, subject_name: 'English Language', subject_code: 'ENG', level: 'Junior' },
  { id: 3, subject_name: 'Physics', subject_code: 'PHY', level: 'Senior' },
  { id: 4, subject_name: 'Chemistry', subject_code: 'CHM', level: 'Senior' },
  { id: 5, subject_name: 'Biology', subject_code: 'BIO', level: 'Senior' },
  { id: 6, subject_name: 'Economics', subject_code: 'ECO', level: 'Senior' },
  { id: 7, subject_name: 'Government', subject_code: 'GOV', level: 'Senior' },
  { id: 8, subject_name: 'Literature', subject_code: 'LIT', level: 'Senior' },
  { id: 9, subject_name: 'Geography', subject_code: 'GEO', level: 'Senior' },
  { id: 10, subject_name: 'Civic Education', subject_code: 'CVE', level: 'Junior' },
  { id: 11, subject_name: 'Computer Science', subject_code: 'CMP', level: 'Senior' },
  { id: 12, subject_name: 'Further Mathematics', subject_code: 'FMT', level: 'Senior' },
];

// Mock Classes
export const mockClasses: Class[] = [
  { id: 1, class_name: 'JSS 1', arm: 'A', level: 'Junior', students_count: 35 },
  { id: 2, class_name: 'JSS 1', arm: 'B', level: 'Junior', students_count: 32 },
  { id: 3, class_name: 'JSS 2', arm: 'A', level: 'Junior', students_count: 38 },
  { id: 4, class_name: 'JSS 2', arm: 'B', level: 'Junior', students_count: 36 },
  { id: 5, class_name: 'JSS 3', arm: 'A', level: 'Junior', students_count: 40 },
  { id: 6, class_name: 'JSS 3', arm: 'B', level: 'Junior', students_count: 37 },
  { id: 7, class_name: 'SS 1', arm: 'A', level: 'Senior', students_count: 42 },
  { id: 8, class_name: 'SS 1', arm: 'B', level: 'Senior', students_count: 39 },
  { id: 9, class_name: 'SS 2', arm: 'A', level: 'Senior', students_count: 45 },
  { id: 10, class_name: 'SS 2', arm: 'B', level: 'Senior', students_count: 41 },
  { id: 11, class_name: 'SS 3', arm: 'A', level: 'Senior', students_count: 38 },
  { id: 12, class_name: 'SS 3', arm: 'B', level: 'Senior', students_count: 35 },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  { id: 1, user_id: 2, first_name: 'Adebayo', last_name: 'Johnson', phone: '08012345678', email: 'adebayo.johnson@school.com', staff_id: 'STF/001', address: 'Lagos, Nigeria', employment_date: '2020-01-15', status: 'Active' },
  { id: 2, user_id: 3, first_name: 'Ngozi', last_name: 'Okafor', phone: '08023456789', email: 'ngozi.okafor@school.com', staff_id: 'STF/002', address: 'Abuja, Nigeria', employment_date: '2019-09-01', status: 'Active' },
  { id: 3, user_id: 4, first_name: 'Ibrahim', last_name: 'Musa', phone: '08034567890', email: 'ibrahim.musa@school.com', staff_id: 'STF/003', address: 'Kano, Nigeria', employment_date: '2021-03-10', status: 'Active' },
  { id: 4, user_id: 5, first_name: 'Funke', last_name: 'Adeyemi', phone: '08045678901', email: 'funke.adeyemi@school.com', staff_id: 'STF/004', address: 'Ibadan, Nigeria', employment_date: '2018-11-20', status: 'Active' },
  { id: 5, user_id: 6, first_name: 'Chidi', last_name: 'Nwosu', phone: '08056789012', email: 'chidi.nwosu@school.com', staff_id: 'STF/005', address: 'Enugu, Nigeria', employment_date: '2022-05-05', status: 'Active' },
  { id: 6, user_id: 7, first_name: 'Aisha', last_name: 'Abdullahi', phone: '08067890123', email: 'aisha.abdullahi@school.com', staff_id: 'STF/006', address: 'Kaduna, Nigeria', employment_date: '2017-07-12', status: 'Active' },
  { id: 7, user_id: 8, first_name: 'Tunde', last_name: 'Bakare', phone: '08078901234', email: 'tunde.bakare@school.com', staff_id: 'STF/007', address: 'Oyo, Nigeria', employment_date: '2023-01-30', status: 'Active' },
  { id: 8, user_id: 9, first_name: 'Grace', last_name: 'Eze', phone: '08089012345', email: 'grace.eze@school.com', staff_id: 'STF/008', address: 'Anambra, Nigeria', employment_date: '2016-04-18', status: 'Active' },
  { id: 9, user_id: 10, first_name: 'Yakubu', last_name: 'Sani', phone: '08090123456', email: 'yakubu.sani@school.com', staff_id: 'STF/009', address: 'Sokoto, Nigeria', employment_date: '2020-08-25', status: 'Active' },
  { id: 10, user_id: 11, first_name: 'Blessing', last_name: 'Okoro', phone: '08001234567', email: 'blessing.okoro@school.com', staff_id: 'STF/010', address: 'Imo, Nigeria', employment_date: '2019-12-03', status: 'Active' },
];

// Mock Students
export const mockStudents: Student[] = [
  { id: 1, admission_no: 'STD/2024/001', first_name: 'Oluwaseun', last_name: 'Adeyemi', gender: 'Male', date_of_birth: '2010-05-15', current_class_id: 7, status: 'Active' },
  { id: 2, admission_no: 'STD/2024/002', first_name: 'Chidinma', last_name: 'Okonkwo', gender: 'Female', date_of_birth: '2010-03-22', current_class_id: 7, status: 'Active' },
  { id: 3, admission_no: 'STD/2024/003', first_name: 'Muhammed', last_name: 'Abubakar', gender: 'Male', date_of_birth: '2010-08-10', current_class_id: 7, status: 'Active' },
  { id: 4, admission_no: 'STD/2024/004', first_name: 'Adaeze', last_name: 'Nwachukwu', gender: 'Female', date_of_birth: '2010-01-28', current_class_id: 7, status: 'Active' },
  { id: 5, admission_no: 'STD/2024/005', first_name: 'Emeka', last_name: 'Obi', gender: 'Male', date_of_birth: '2010-11-05', current_class_id: 7, status: 'Active' },
  { id: 6, admission_no: 'STD/2024/006', first_name: 'Fatima', last_name: 'Yusuf', gender: 'Female', date_of_birth: '2010-07-19', current_class_id: 7, status: 'Active' },
  { id: 7, admission_no: 'STD/2024/007', first_name: 'Tochukwu', last_name: 'Eze', gender: 'Male', date_of_birth: '2010-04-03', current_class_id: 7, status: 'Active' },
  { id: 8, admission_no: 'STD/2024/008', first_name: 'Aminat', last_name: 'Bello', gender: 'Female', date_of_birth: '2010-09-25', current_class_id: 7, status: 'Active' },
  { id: 9, admission_no: 'STD/2024/009', first_name: 'Ifeanyi', last_name: 'Chukwu', gender: 'Male', date_of_birth: '2010-02-14', current_class_id: 7, status: 'Active' },
  { id: 10, admission_no: 'STD/2024/010', first_name: 'Blessing', last_name: 'Akpan', gender: 'Female', date_of_birth: '2010-06-30', current_class_id: 7, status: 'Active' },
  { id: 11, admission_no: 'STD/2024/011', first_name: 'David', last_name: 'Okafor', gender: 'Male', date_of_birth: '2010-12-08', current_class_id: 8, status: 'Active' },
  { id: 12, admission_no: 'STD/2024/012', first_name: 'Precious', last_name: 'Nnamdi', gender: 'Female', date_of_birth: '2010-10-17', current_class_id: 8, status: 'Active' },
  { id: 13, admission_no: 'STD/2024/013', first_name: 'Samuel', last_name: 'Adeleke', gender: 'Male', date_of_birth: '2009-05-20', current_class_id: 9, status: 'Active' },
  { id: 14, admission_no: 'STD/2024/014', first_name: 'Grace', last_name: 'Uche', gender: 'Female', date_of_birth: '2009-03-11', current_class_id: 9, status: 'Active' },
  { id: 15, admission_no: 'STD/2024/015', first_name: 'Peter', last_name: 'Ojo', gender: 'Male', date_of_birth: '2009-08-27', current_class_id: 9, status: 'Active' },
  { id: 16, admission_no: 'STD/2024/016', first_name: 'Victoria', last_name: 'Obi', gender: 'Female', date_of_birth: '2009-01-05', current_class_id: 9, status: 'Active' },
  { id: 17, admission_no: 'STD/2024/017', first_name: 'John', last_name: 'Olawale', gender: 'Male', date_of_birth: '2008-06-14', current_class_id: 11, status: 'Active' },
  { id: 18, admission_no: 'STD/2024/018', first_name: 'Mary', last_name: 'Abdullahi', gender: 'Female', date_of_birth: '2008-04-22', current_class_id: 11, status: 'Active' },
  { id: 19, admission_no: 'STD/2024/019', first_name: 'Emmanuel', last_name: 'Ikenna', gender: 'Male', date_of_birth: '2008-09-09', current_class_id: 11, status: 'Active' },
  { id: 20, admission_no: 'STD/2024/020', first_name: 'Sarah', last_name: 'Mohammed', gender: 'Female', date_of_birth: '2008-11-30', current_class_id: 11, status: 'Active' },
];

// Mock Teacher-Subject-Class Assignments
export const mockTeacherSubjectAssignments: TeacherSubjectClass[] = [
  { id: 1, teacher_id: 1, subject_id: 1, class_id: 7 },
  { id: 2, teacher_id: 1, subject_id: 1, class_id: 8 },
  { id: 3, teacher_id: 2, subject_id: 2, class_id: 7 },
  { id: 4, teacher_id: 2, subject_id: 2, class_id: 8 },
  { id: 5, teacher_id: 3, subject_id: 3, class_id: 9 },
  { id: 6, teacher_id: 3, subject_id: 3, class_id: 10 },
  { id: 7, teacher_id: 4, subject_id: 4, class_id: 9 },
  { id: 8, teacher_id: 4, subject_id: 4, class_id: 10 },
  { id: 9, teacher_id: 5, subject_id: 5, class_id: 11 },
  { id: 10, teacher_id: 5, subject_id: 5, class_id: 12 },
];

// Mock Form Teachers
export const mockFormTeachers: FormTeacher[] = [
  { id: 1, teacher_id: 1, class_id: 7, session_id: 2 },
  { id: 2, teacher_id: 2, class_id: 8, session_id: 2 },
  { id: 3, teacher_id: 3, class_id: 9, session_id: 2 },
  { id: 4, teacher_id: 4, class_id: 10, session_id: 2 },
  { id: 5, teacher_id: 5, class_id: 11, session_id: 2 },
  { id: 6, teacher_id: 6, class_id: 12, session_id: 2 },
];

// Generate mock results for a student
export function generateMockResults(studentId: number, classId: number): Result[] {
  const results: Result[] = [];
  const subjectIds = [1, 2, 3, 4, 5, 6, 7, 8]; // 8 subjects
  let resultId = studentId * 100;

  subjectIds.forEach((subjectId) => {
    mockAssessments.forEach((assessment) => {
      const maxScore = assessment.max_score;
      const score = Math.floor(Math.random() * (maxScore * 0.4)) + Math.floor(maxScore * 0.5);
      
      results.push({
        id: resultId++,
        student_id: studentId,
        subject_id: subjectId,
        class_id: classId,
        teacher_id: Math.ceil(subjectId / 2),
        session_id: 2,
        term_id: 1,
        assessment_id: assessment.id,
        score: Math.min(score, maxScore),
      });
    });
  });

  return results;
}

// Generate mock results for a class and subject
export function generateMockResultsForClassSubject(classId: number, subjectId: number): Result[] {
  const results: Result[] = [];
  const students = mockStudents.filter(s => s.current_class_id === classId && s.status === 'Active');
  let resultId = classId * 1000 + subjectId * 100;

  students.forEach((student) => {
    mockAssessments.forEach((assessment) => {
      const maxScore = assessment.max_score;
      const score = Math.floor(Math.random() * (maxScore * 0.4)) + Math.floor(maxScore * 0.5);
      
      results.push({
        id: resultId++,
        student_id: student.id,
        subject_id: subjectId,
        class_id: classId,
        teacher_id: Math.ceil(subjectId / 2),
        session_id: 2,
        term_id: 1,
        assessment_id: assessment.id,
        score: Math.min(score, maxScore),
      });
    });
  });

  return results;
}

// Generate student result summary
export function generateStudentResultSummary(studentOrId: Student | number, classId?: number): StudentResultSummary {
  // Support both Student object or studentId + classId
  let student: Student;
  let resolvedClassId: number;
  
  if (typeof studentOrId === 'number') {
    const foundStudent = mockStudents.find((s) => s.id === studentOrId);
    if (!foundStudent) {
      throw new Error(`Student with id ${studentOrId} not found`);
    }
    student = foundStudent;
    resolvedClassId = classId ?? student.current_class_id;
  } else {
    student = studentOrId;
    resolvedClassId = classId ?? student.current_class_id;
  }
  
  const results = generateMockResults(student.id, resolvedClassId);
  const subjectScores = new Map<number, { test1: number; test2: number; test3: number; exam: number }>();
  
  results.forEach((result) => {
    if (!subjectScores.has(result.subject_id)) {
      subjectScores.set(result.subject_id, { test1: 0, test2: 0, test3: 0, exam: 0 });
    }
    const scores = subjectScores.get(result.subject_id)!;
    
    if (result.assessment_id === 1) scores.test1 = result.score;
    if (result.assessment_id === 2) scores.test2 = result.score;
    if (result.assessment_id === 3) scores.test3 = result.score;
    if (result.assessment_id === 4) scores.exam = result.score;
  });

  const subjects = Array.from(subjectScores.entries()).map(([subjectId, scores]) => {
    const subject = mockSubjects.find((s) => s.id === subjectId);
    const total = scores.test1 + scores.test2 + scores.test3 + scores.exam;
    const { grade, remark } = calculateGrade(total);
    
    return {
      subject_id: subjectId,
      subject_name: subject?.subject_name || 'Unknown',
      test1: scores.test1,
      test2: scores.test2,
      test3: scores.test3,
      exam: scores.exam,
      total,
      grade,
      remark,
    };
  });

  const totalScore = subjects.reduce((sum, s) => sum + s.total, 0);
  const average = Math.round((totalScore / subjects.length) * 100) / 100;
  const { grade } = calculateGrade(average);

  return {
    student_id: student.id,
    student,
    subjects,
    total_score: totalScore,
    average,
    grade,
    position: Math.floor(Math.random() * 20) + 1,
    term: mockTerms[0],
    session: mockSessions[1],
  };
}

// Mock Attendance - generates daily attendance records for a month
export function generateMockAttendance(_studentId: number, _classId: number, month: string): Array<{ date: string; status: 'present' | 'absent' | 'late' | 'excused' }> {
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const records: Array<{ date: string; status: 'present' | 'absent' | 'late' | 'excused' }> = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthNum - 1, day);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Weight towards present (80% present, 10% late, 7% absent, 3% excused)
    const rand = Math.random();
    let status: 'present' | 'absent' | 'late' | 'excused';
    if (rand < 0.80) status = 'present';
    else if (rand < 0.90) status = 'late';
    else if (rand < 0.97) status = 'absent';
    else status = 'excused';
    
    records.push({
      date: `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status,
    });
  }
  
  return records;
}

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  total_students: 458,
  total_teachers: 10,
  total_classes: 12,
  total_subjects: 12,
  current_session: mockSessions[1],
  current_term: mockTerms[0],
  recent_activities: [
    { id: 1, action: 'Result Entry', description: 'SS 1A Mathematics results entered', user: 'Mr. Adebayo', timestamp: '2024-12-30T10:30:00' },
    { id: 2, action: 'Student Enrolled', description: 'New student enrolled in JSS 1A', user: 'Admin', timestamp: '2024-12-30T09:15:00' },
    { id: 3, action: 'Result Approved', description: 'SS 2A First Term results approved', user: 'Admin', timestamp: '2024-12-29T16:45:00' },
    { id: 4, action: 'Attendance Updated', description: 'JSS 3B attendance records updated', user: 'Mrs. Ngozi', timestamp: '2024-12-29T14:20:00' },
    { id: 5, action: 'Class Created', description: 'New class SS 1C created', user: 'Admin', timestamp: '2024-12-28T11:00:00' },
  ],
};

// Helper to get students by class
export function getStudentsByClass(classId: number): Student[] {
  return mockStudents.filter((s) => s.current_class_id === classId);
}

// Helper to get class display name
export function getClassDisplayName(classObj: Class): string {
  return `${classObj.class_name} ${classObj.arm}`;
}

// Helper to generate class result summary
export function generateClassResultSummary(classId: number) {
  const students = getStudentsByClass(classId);
  const classObj = mockClasses.find((c) => c.id === classId);
  
  const studentSummaries = students.map((student, index) => {
    const summary = generateStudentResultSummary(student);
    return { ...summary, position: index + 1 };
  });

  // Sort by average and assign positions
  studentSummaries.sort((a, b) => b.average - a.average);
  studentSummaries.forEach((s, i) => {
    s.position = i + 1;
  });

  const averages = studentSummaries.map((s) => s.average);
  
  return {
    class_id: classId,
    class: classObj!,
    term: mockTerms[0],
    session: mockSessions[1],
    students: studentSummaries,
    class_average: Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 100) / 100,
    highest_score: Math.max(...averages),
    lowest_score: Math.min(...averages),
    is_approved: false,
    is_locked: false,
  };
}
