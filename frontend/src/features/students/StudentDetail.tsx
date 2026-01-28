import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Table, Spinner, Alert } from '../../components/common';
import { getClassDisplayName } from '../../utils/mockData';
import { getFullName, formatDate, getPositionSuffix } from '../../utils/helpers';
import { STATUS_COLORS, GRADE_COLORS } from '../../utils/constants';
import type { SubjectScore, Student } from '../../types';
import { ArrowLeft, Edit, FileText, Phone, Calendar, MapPin, User } from 'lucide-react';
import StudentForm from './StudentForm';
import { useStudentQuery } from '../../hooks/useStudents';
import { useClassQuery } from '../../hooks/useClasses';
import { useCurrentSession, useCurrentTerm } from '../../hooks/useSessionTerm';
import { studentsApi } from './students.api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const studentId = parseInt(id || '0');
  
  // Get user role information
  const { user } = useAuth();
  const { isAdmin, canManageStudents } = useRole();
  const isFormTeacher = user?.role === 'Form Teacher';
  const isSubjectTeacher = user?.role === 'Subject Teacher';

  // Determine back navigation based on role
  const handleBackNavigation = () => {
    if (isFormTeacher) {
      navigate('/dashboard/my-class');
    } else if (isSubjectTeacher) {
      navigate('/dashboard/classes');
    } else {
      navigate('/dashboard/students');
    }
  };

  // Fetch student data from API
  const { data: studentResponse, isLoading: studentLoading, error: studentError } = useStudentQuery(studentId, {
    enabled: !!studentId,
  });

  // Get the student data - handle both snake_case and camelCase
  const student: Student | null = useMemo(() => {
    const data = studentResponse?.data;
    if (!data) return null;
    
    // Normalize the data to snake_case for display
    return {
      id: data.id,
      admission_no: data.admission_no || data.admissionNo,
      first_name: data.first_name || data.firstName,
      last_name: data.last_name || data.lastName,
      gender: data.gender,
      date_of_birth: data.date_of_birth || data.dateOfBirth,
      current_class_id: data.current_class_id || data.currentClassId,
      status: data.status,
      guardian_name: data.guardian_name || data.guardianName,
      guardian_phone: data.guardian_phone || data.guardianPhone,
      address: data.address,
      currentClass: data.currentClass,
    } as Student;
  }, [studentResponse]);

  const classId = student?.current_class_id || student?.currentClassId;

  // Fetch class data
  const { data: classResponse } = useClassQuery(classId || 0, {
    enabled: !!classId,
  });

  const studentClass = classResponse?.data || student?.currentClass || null;

  // Fetch current session and term
  const { data: currentSession } = useCurrentSession();
  const { data: currentTerm } = useCurrentTerm();

  // Fetch student results
  const { data: resultsResponse } = useQuery({
    queryKey: ['student-results', studentId, currentTerm?.id, currentSession?.id],
    queryFn: () => studentsApi.getResults(studentId, { 
      term_id: currentTerm?.id, 
      session_id: currentSession?.id 
    }),
    enabled: !!studentId && !!currentTerm?.id && !!currentSession?.id,
  });

  // Fetch student attendance
  const { data: attendanceResponse } = useQuery({
    queryKey: ['student-attendance', studentId, currentTerm?.id, currentSession?.id],
    queryFn: () => studentsApi.getAttendance(studentId, {
      term_id: currentTerm?.id,
      session_id: currentSession?.id,
    }),
    enabled: !!studentId && !!currentTerm?.id && !!currentSession?.id,
  });

  // Process results data
  const resultSummary = useMemo(() => {
    const results = resultsResponse?.data;
    if (!results || !Array.isArray(results) || results.length === 0) {
      return null;
    }

    // Calculate totals from results
    const subjects = results.map((r: any) => ({
      subject_id: r.subject?.id || r.subjectId,
      subject_name: r.subject?.subjectName || r.subject_name || 'Unknown Subject',
      test1: r.test1 || r.ca1 || 0,
      test2: r.test2 || r.ca2 || 0,
      test3: r.test3 || r.ca3 || 0,
      exam: r.exam || r.examScore || 0,
      total: r.total || (r.test1 || 0) + (r.test2 || 0) + (r.test3 || 0) + (r.exam || 0),
      grade: r.grade || 'N/A',
      remark: r.remark || '',
    }));

    const total_score = subjects.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
    const average = subjects.length > 0 ? Math.round(total_score / subjects.length) : 0;
    
    // Calculate grade from average
    let grade = 'F';
    if (average >= 70) grade = 'A';
    else if (average >= 60) grade = 'B';
    else if (average >= 50) grade = 'C';
    else if (average >= 45) grade = 'D';
    else if (average >= 40) grade = 'E';

    return {
      total_score,
      average,
      grade,
      position: 1, // Position would need to be calculated on backend
      subjects,
      term: currentTerm || { termName: 'Current Term' },
      session: currentSession || { sessionName: 'Current Session' },
    };
  }, [resultsResponse, currentSession, currentTerm]);

  // Process attendance data
  const attendance = useMemo(() => {
    const records = attendanceResponse?.data;
    if (!records || !Array.isArray(records)) {
      return { days_present: 0, days_absent: 0, total_days: 0 };
    }

    const days_present = records.filter((r: any) => r.status === 'present' || r.status === 'Present').length;
    const days_absent = records.filter((r: any) => r.status === 'absent' || r.status === 'Absent').length;
    const total_days = records.length;

    return { days_present, days_absent, total_days };
  }, [attendanceResponse]);

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Failed to load student details. Please try again.</Alert>
        <Button variant="outline" onClick={handleBackNavigation} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Student not found</p>
        <Button variant="outline" onClick={handleBackNavigation} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const resultColumns = [
    { key: 'subject_name', header: 'Subject' },
    { key: 'test1', header: 'Test 1 (10)' },
    { key: 'test2', header: 'Test 2 (10)' },
    { key: 'test3', header: 'Test 3 (10)' },
    { key: 'exam', header: 'Exam (70)' },
    { key: 'total', header: 'Total (100)' },
    {
      key: 'grade',
      header: 'Grade',
      render: (_value: unknown, item: SubjectScore, _index: number) => (
        <Badge className={GRADE_COLORS[item.grade] || 'bg-gray-100 text-gray-800'}>
          {item.grade}
        </Badge>
      ),
    },
    { key: 'remark', header: 'Remark' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBackNavigation}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Student Profile</h1>
            <p className="text-secondary-500">{student.admission_no}</p>
          </div>
        </div>
        {/* Only show Print Report and Edit Profile for Admin */}
        {isAdmin && (
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />} onClick={() => navigate('/dashboard/reports/student')}>
              Print Report
            </Button>
            <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => setShowFormModal(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent>
            <div className="text-center">
              <Avatar
                firstName={student.first_name}
                lastName={student.last_name}
                size="xl"
                className="mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-secondary-900">
                {getFullName(student.first_name, student.last_name)}
              </h2>
              <Badge className={STATUS_COLORS[student.status]} size="sm">
                {student.status}
              </Badge>
              {studentClass && (
                <p className="mt-2 text-secondary-500">{getClassDisplayName(studentClass)}</p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-secondary-600">
                <User className="h-5 w-5 text-secondary-400" />
                <span>{student.gender}</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-600">
                <Calendar className="h-5 w-5 text-secondary-400" />
                <span>{formatDate(student.date_of_birth, 'long')}</span>
              </div>
              {student.guardian_phone && (
                <div className="flex items-center gap-3 text-secondary-600">
                  <Phone className="h-5 w-5 text-secondary-400" />
                  <span>{student.guardian_phone}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-3 text-secondary-600">
                  <MapPin className="h-5 w-5 text-secondary-400" />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Total Score</p>
              <p className="text-3xl font-bold text-secondary-900">{resultSummary?.total_score}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Average</p>
              <p className="text-3xl font-bold text-primary-600">{resultSummary?.average}%</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Grade</p>
              <p className="text-3xl font-bold text-green-600">{resultSummary?.grade}</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <p className="text-sm text-secondary-500">Position</p>
              <p className="text-3xl font-bold text-purple-600">
                {resultSummary ? getPositionSuffix(resultSummary.position) : '-'}
              </p>
            </div>
          </Card>

          {/* Attendance Card */}
          <Card className="col-span-2 md:col-span-4">
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-secondary-500">Days Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendance?.days_present}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Days Absent</p>
                  <p className="text-2xl font-bold text-red-600">{attendance?.days_absent}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Total Days</p>
                  <p className="text-2xl font-bold text-secondary-900">{attendance?.total_days}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-secondary-500">Attendance Rate</span>
                  <span className="font-medium text-secondary-900">
                    {attendance ? Math.round((attendance.days_present / attendance.total_days) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        attendance
                          ? Math.round((attendance.days_present / attendance.total_days) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Academic Results - {resultSummary?.term?.termName || resultSummary?.term?.term_name || 'Current Term'} ({resultSummary?.session?.sessionName || resultSummary?.session?.session_name || 'Current Session'})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table
            columns={resultColumns}
            data={resultSummary?.subjects || []}
            keyExtractor={(item) => item.subject_id}
          />
        </div>
      </Card>

      {/* Student Form Modal - Only for Admin */}
      {isAdmin && (
        <StudentForm
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          student={student}
          onSave={(data) => {
            console.log('Updating student:', data);
            setShowFormModal(false);
          }}
        />
      )}
    </div>
  );
};

export default StudentDetail;
