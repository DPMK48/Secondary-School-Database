import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Table } from '../../components/common';
import { mockStudents, mockClasses, getClassDisplayName, generateStudentResultSummary, generateMockAttendance } from '../../utils/mockData';
import { getFullName, formatDate, getPositionSuffix } from '../../utils/helpers';
import { STATUS_COLORS, GRADE_COLORS } from '../../utils/constants';
import type { SubjectScore } from '../../types';
import { ArrowLeft, Edit, FileText, Phone, Calendar, MapPin, User } from 'lucide-react';
import StudentForm from './StudentForm';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);

  const student = useMemo(() => {
    return mockStudents.find((s) => s.id === parseInt(id || '0'));
  }, [id]);

  const studentClass = useMemo(() => {
    if (!student) return null;
    return mockClasses.find((c) => c.id === student.current_class_id);
  }, [student]);

  const resultSummary = useMemo(() => {
    if (!student) return null;
    return generateStudentResultSummary(student);
  }, [student]);

  const attendance = useMemo(() => {
    if (!student) return null;
    const records = generateMockAttendance(student.id, student.current_class_id, '2024-01');
    const days_present = records.filter(r => r.status === 'present').length;
    const days_absent = records.filter(r => r.status === 'absent').length;
    const total_days = records.length;
    return { records, days_present, days_absent, total_days };
  }, [student]);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Student not found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/students')} className="mt-4">
          Go back to Students
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
            onClick={() => navigate('/dashboard/students')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Student Profile</h1>
            <p className="text-secondary-500">{student.admission_no}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />} onClick={() => navigate('/dashboard/reports/student')}>
            Print Report
          </Button>
          <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => setShowFormModal(true)}>
            Edit Profile
          </Button>
        </div>
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
            Academic Results - {resultSummary?.term.term_name} ({resultSummary?.session.session_name})
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

      {/* Student Form Modal */}
      <StudentForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        student={student}
        onSave={(data) => {
          console.log('Updating student:', data);
          setShowFormModal(false);
        }}
      />
    </div>
  );
};

export default StudentDetail;
