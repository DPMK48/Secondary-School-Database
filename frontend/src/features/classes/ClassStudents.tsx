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
} from '../../components/common';
import {
  mockClasses,
  mockStudents,
  mockFormTeachers,
  mockTeachers,
  mockSubjects,
  mockTeacherSubjectAssignments,
  getClassDisplayName,
} from '../../utils/mockData';
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

const ClassStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageClasses, canManageStudents } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const classId = parseInt(id || '0');
  const currentClass = mockClasses.find((c) => c.id === classId);

  const formTeacher = useMemo(() => {
    const ft = mockFormTeachers.find((f) => f.class_id === classId);
    if (!ft) return null;
    return mockTeachers.find((t) => t.id === ft.teacher_id);
  }, [classId]);

  // Get subjects taught in this class
  const classSubjects = useMemo(() => {
    if (!currentClass) return [];
    const assignments = mockTeacherSubjectAssignments.filter((a) => a.class_id === classId);
    return assignments.map((a) => {
      const subject = mockSubjects.find((s) => s.id === a.subject_id);
      const teacher = mockTeachers.find((t) => t.id === a.teacher_id);
      return { subject, teacher };
    });
  }, [classId, currentClass]);

  // Get students in this class
  const classStudents = useMemo(() => {
    return mockStudents.filter((s) => s.current_class_id === classId);
  }, [classId]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const fullName = getFullName(student.first_name, student.last_name);
      const matchesSearch =
        !searchQuery ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_no.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = !genderFilter || student.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [classStudents, searchQuery, genderFilter]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

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
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
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
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'age',
      label: 'Age',
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
        <span>{calculateAge(row.date_of_birth)} years</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: (typeof mockStudents)[0]) =>
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

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subjects ({classSubjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {classSubjects.slice(0, 6).map(({ subject }, index) =>
                subject ? (
                  <Badge key={index} variant="secondary" size="sm">
                    {subject.subject_name}
                  </Badge>
                ) : null
              )}
              {classSubjects.length > 6 && (
                <Badge variant="secondary" size="sm">
                  +{classSubjects.length - 6} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classSubjects.map(({ subject, teacher }, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{subject?.subject_name}</p>
                  <p className="text-xs text-secondary-500">
                    {teacher ? getFullName(teacher.first_name, teacher.last_name) : 'Not assigned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

          <Table
            columns={columns}
            data={filteredStudents}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No students found"
          />
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
