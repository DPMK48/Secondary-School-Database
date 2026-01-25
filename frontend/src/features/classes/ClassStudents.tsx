import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Avatar,
  Badge,
  Modal,
  Select,
  Spinner,
  Alert,
} from '../../components/common';
import { getClassDisplayName } from '../../utils/mockData';
import { getFullName, calculateAge } from '../../utils/helpers';
import {
  ArrowLeft,
  Search,
  UserPlus,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Eye,
} from 'lucide-react';
import { useClassQuery, useClassStudentsQuery, useClassSubjectsQuery } from '../../hooks/useClasses';
import type { Student } from '../../types';

const ClassStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageClasses, canManageStudents } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const classId = parseInt(id || '0');

  // Fetch class data from API
  const { data: classResponse, isLoading: classLoading, error: classError } = useClassQuery(classId, {
    enabled: !!classId,
  });

  // Fetch students in this class
  const { data: studentsResponse, isLoading: studentsLoading, error: studentsError } = useClassStudentsQuery(classId, {
    enabled: !!classId,
  });

  // Fetch subjects for this class
  const { data: subjectsResponse, error: subjectsError } = useClassSubjectsQuery(classId, {
    enabled: !!classId,
  });

  // Debug logging
  console.log('🔍 ClassStudents Debug:', {
    classId,
    classResponse,
    studentsResponse,
    subjectsResponse,
    classError,
    studentsError,
    subjectsError,
  });

  // Get class data - normalize to handle both camelCase and snake_case
  const currentClass = useMemo(() => {
    const data = classResponse?.data;
    if (!data) return null;

    return {
      id: data.id,
      className: data.className || data.class_name,
      arm: data.arm,
      level: data.level,
    };
  }, [classResponse]);

  // Get form teacher from class data
  const formTeacher = useMemo(() => {
    const data = classResponse?.data;
    if (!data) return null;

    const ft = data.form_teacher || data.formTeacher;
    if (!ft) return null;

    return {
      id: ft.id,
      first_name: ft.first_name || ft.firstName,
      last_name: ft.last_name || ft.lastName,
      email: ft.email,
      phone: ft.phone,
    };
  }, [classResponse]);

  // Get subjects taught in this class
  const classSubjects = useMemo(() => {
    const data = subjectsResponse?.data;
    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      subject: item.subject ? {
        id: item.subject.id,
        subject_name: item.subject.subjectName || item.subject.subject_name,
      } : null,
      teacher: item.teacher ? {
        first_name: item.teacher.firstName || item.teacher.first_name,
        last_name: item.teacher.lastName || item.teacher.last_name,
      } : null,
    }));
  }, [subjectsResponse]);

  // Get students in this class - normalize data
  const classStudents: Student[] = useMemo(() => {
    const data = studentsResponse?.data?.data || studentsResponse?.data;
    if (!data || !Array.isArray(data)) return [];

    return data.map((s: any) => ({
      id: s.id,
      admission_no: s.admission_no || s.admissionNo,
      first_name: s.first_name || s.firstName,
      last_name: s.last_name || s.lastName,
      gender: s.gender,
      date_of_birth: s.date_of_birth || s.dateOfBirth,
      current_class_id: s.current_class_id || s.currentClassId,
      status: s.status,
    } as Student));
  }, [studentsResponse]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const fullName = getFullName(student.first_name, student.last_name);
      const matchesSearch =
        !searchQuery ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.admission_no || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = !genderFilter || student.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [classStudents, searchQuery, genderFilter]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  if (classLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (classError) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Failed to load class details. Please try again.</Alert>
        <Button variant="outline" onClick={() => navigate('/dashboard/classes')} className="mt-4">
          Back to Classes
        </Button>
      </div>
    );
  }

  if (!currentClass) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Class not found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/classes')} className="mt-4">
          Back to Classes
        </Button>
      </div>
    );
  }

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: Student) => (
        <div className="flex items-center gap-3">
          <Avatar name={getFullName(row.first_name, row.last_name)} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(row.first_name, row.last_name)}
            </p>
            <p className="text-xs text-secondary-500">{row.admission_no}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_value: unknown, row: Student) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'age',
      label: 'Age',
      render: (_value: unknown, row: Student) => (
        <span>{row.date_of_birth ? `${calculateAge(row.date_of_birth)} years` : 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: Student) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Student) =>
        canManageStudents ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/dashboard/students/${row.id}`)}
          >
            View
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/classes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900">
            {getClassDisplayName(currentClass)}
          </h1>
          <p className="text-secondary-500 mt-1">View and manage students in this class</p>
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">Total Students</span>
                </div>
                <span className="font-semibold">{classStudents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Male</span>
                <span className="font-semibold">
                  {classStudents.filter((s) => s.gender === 'Male').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Female</span>
                <span className="font-semibold">
                  {classStudents.filter((s) => s.gender === 'Female').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Teacher */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Form Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            {formTeacher ? (
              <div className="flex items-center gap-3">
                <Avatar
                  name={getFullName(formTeacher.first_name, formTeacher.last_name)}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-secondary-900">
                    {getFullName(formTeacher.first_name, formTeacher.last_name)}
                  </p>
                  <p className="text-xs text-secondary-500 flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {formTeacher.email}
                  </p>
                  <p className="text-xs text-secondary-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formTeacher.phone}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-secondary-500 text-sm">No form teacher assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Students</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                Export
              </Button>
              {canManageClasses && (
                <Button
                  size="sm"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  onClick={() => setShowAddStudentModal(true)}
                >
                  Add Student
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>
            <Select
              options={genderOptions}
              value={genderFilter}
              onChange={setGenderFilter}
              placeholder="All Genders"
            />
          </div>

          {studentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
              <span className="ml-2 text-secondary-500">Loading students...</span>
            </div>
          ) : studentsError ? (
            <div className="text-center py-12">
              <Alert variant="error" className="mb-4">
                Failed to load students. Please refresh the page.
              </Alert>
              <p className="text-sm text-secondary-500">Error: {(studentsError as any)?.message}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No students in this class</h3>
              <p className="text-secondary-500 mb-4">
                {searchQuery || genderFilter
                  ? 'Try adjusting your search filters'
                  : 'Add students to this class from the Students page'}
              </p>
              {canManageStudents && !searchQuery && !genderFilter && (
                <Button onClick={() => navigate('/dashboard/students')}>
                  Go to Students
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No students found in this class"
            />
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Add Student to Class"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddStudentModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddStudentModal(false)}>Add Student</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input placeholder="Search for student..." leftIcon={<Search className="h-5 w-5" />} />
          <p className="text-sm text-secondary-500">
            Select a student to add to {getClassDisplayName(currentClass)}
          </p>
          {/* Student selection would go here */}
          <div className="border border-secondary-200 rounded-lg p-4 text-center text-secondary-500">
            Search results will appear here
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassStudents;
