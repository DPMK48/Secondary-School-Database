import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  Avatar,
  Badge,
  Spinner,
  Input,
  Pagination,
} from '../../components/common';
import { useClassQuery, useClassStudentsQuery } from '../../hooks/useClasses';
import { getFullName } from '../../utils/helpers';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Search,
  ChevronRight,
  Eye,
} from 'lucide-react';

/**
 * MyClass Component
 * Displays the class that a form teacher oversees
 * Shows class info, students list, and quick actions
 */
const MyClass: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const classId = user?.formTeacherClassId;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch class details
  const { data: classData, isLoading: classLoading, error: classError } = useClassQuery(classId || 0);
  
  // Fetch students in the class
  const { data: studentsData, isLoading: studentsLoading } = useClassStudentsQuery(
    classId || 0,
    { page: currentPage, perPage: itemsPerPage }
  );

  const classInfo = classData?.data || classData;
  const students = studentsData?.data || [];
  const studentsMeta = studentsData?.meta || { total: 0, page: 1, totalPages: 1 };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((student: any) => {
      const fullName = getFullName(
        student.first_name || student.firstName,
        student.last_name || student.lastName
      ).toLowerCase();
      const admissionNo = (student.admission_no || student.admissionNo || '').toLowerCase();
      return fullName.includes(query) || admissionNo.includes(query);
    });
  }, [students, searchQuery]);

  // Table columns for students
  const columns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_: any, __: any, index?: number) => (
        <span className="text-secondary-500 font-medium">
          {((currentPage - 1) * itemsPerPage) + (index || 0) + 1}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={getFullName(row.first_name || row.firstName, row.last_name || row.lastName)}
            size="sm"
          />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(row.first_name || row.firstName, row.last_name || row.lastName)}
            </p>
            <p className="text-xs text-secondary-500">
              {row.admission_no || row.admissionNo}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_: any, row: any) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: any) => (
        <Badge
          variant={row.status === 'Active' ? 'success' : 'warning'}
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Eye className="h-4 w-4" />}
          onClick={() => navigate(`/dashboard/students/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (!classId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Class</h1>
          <p className="text-secondary-500 mt-1">View and manage your assigned class</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No Class Assigned
              </h3>
              <p className="text-secondary-500">
                You have not been assigned as a form teacher to any class yet.
                Please contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (classLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (classError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Class</h1>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-error-600">
              <p>Error loading class information. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const className = classInfo?.className || classInfo?.class_name || user?.formTeacherClassName || 'My Class';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">My Class</h1>
        <p className="text-secondary-500 mt-1">
          Manage your class - {className} {classInfo?.arm && `Arm ${classInfo.arm}`}
        </p>
      </div>

      {/* Class Overview Card */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{className}</h2>
                <p className="text-primary-100 mt-1">
                  {classInfo?.level} Secondary • Arm {classInfo?.arm}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{studentsMeta.total || filteredStudents.length}</p>
              <p className="text-primary-100">Students</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200"
          onClick={() => navigate('/dashboard/attendance')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">Mark Attendance</h3>
                <p className="text-sm text-secondary-500">Record daily attendance</p>
              </div>
              <ChevronRight className="h-5 w-5 text-secondary-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
          onClick={() => navigate('/dashboard/results')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">View Results</h3>
                <p className="text-sm text-secondary-500">Check class results</p>
              </div>
              <ChevronRight className="h-5 w-5 text-secondary-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students in Class
          </CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
              <p className="text-secondary-500">
                {searchQuery ? 'No students match your search' : 'No students in this class'}
              </p>
            </div>
          ) : (
            <>
              <Table 
                columns={columns} 
                data={filteredStudents}
                keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
              />
              {studentsMeta.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={studentsMeta.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={studentsMeta.total}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyClass;
