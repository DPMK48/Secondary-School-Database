import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useDebounce } from '../../hooks/useDebounce';
import { Button, Input, Select, Table, Pagination, Badge, Avatar, Card, Modal, Alert } from '../../components/common';
import { mockClasses, getClassDisplayName } from '../../utils/mockData';
import { getFullName, formatDate } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import type { Student } from '../../types';
import { Search, Plus, Download, Eye, Edit, Trash2, Users, FileSpreadsheet, FileText } from 'lucide-react';
import StudentForm from './StudentForm';
import { useStudentsQuery, useDeleteStudentMutation } from '../../hooks/useStudents';
import { useClassesQuery } from '../../hooks/useClasses';

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { canManageStudents, isAuthenticated, token } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const itemsPerPage = 10;

  // Fetch students with filters - only if authenticated
  const { data: studentsData, isLoading, error, refetch } = useStudentsQuery({
    search: debouncedSearch,
    classId: classFilter ? parseInt(classFilter) : undefined,
    status: statusFilter || undefined,
    page: currentPage,
    perPage: itemsPerPage,
  }, { enabled: isAuthenticated && !!token });

  // Fetch classes for filter dropdown - only if authenticated
  const { data: classesData } = useClassesQuery({}, { enabled: isAuthenticated && !!token });

  // Delete mutation
  const deleteMutation = useDeleteStudentMutation();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, classFilter, statusFilter]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-dropdown')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Get data from API response
  const students = studentsData?.data || [];
  const meta = studentsData?.meta || { total: 0, page: 1, perPage: itemsPerPage, totalPages: 0 };

  // Calculate stats
  const stats = useMemo(() => {
    if (!students.length) {
      return { total: 0, active: 0, male: 0, female: 0 };
    }
    return {
      total: meta.total,
      active: students.filter((s: Student) => s.status === 'Active').length,
      male: students.filter((s: Student) => s.gender === 'Male').length,
      female: students.filter((s: Student) => s.gender === 'Female').length,
    };
  }, [students, meta.total]);

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setShowFormModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowFormModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      await deleteMutation.mutateAsync(selectedStudent.id);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      refetch();
    } catch (error) {
      console.error('Error deleting student:', error);
      // Error will be shown by mutation
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (!students.length) return;

    const headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Date of Birth', 'Class', 'Status'];
    const rows = students.map((student: Student) => [
      student.admission_no,
      student.first_name,
      student.last_name,
      student.gender,
      formatDate(student.date_of_birth),
      student.currentClass?.class_name || '-',
      student.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    // For Excel export, we'll use the same CSV format but with .xls extension
    // In production, you'd want to use a library like xlsx
    if (!students.length) return;

    const headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Date of Birth', 'Class', 'Status', 'Guardian Name', 'Guardian Phone'];
    const rows = students.map((student: Student) => [
      student.admission_no,
      student.first_name,
      student.last_name,
      student.gender,
      formatDate(student.date_of_birth),
      student.currentClass?.class_name || '-',
      student.status,
      student.guardian_name || '-',
      student.guardian_phone || '-',
    ]);

    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const classOptions = (classesData?.data || []).map((c: any) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Graduated', label: 'Graduated' },
    { value: 'Transferred', label: 'Transferred' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (_value: unknown, student: Student, _index: number) => (
        <div className="flex items-center gap-3">
          <Avatar 
            firstName={student.firstName || student.first_name || ''} 
            lastName={student.lastName || student.last_name || ''} 
            size="sm" 
          />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(student.firstName || student.first_name || '', student.lastName || student.last_name || '')}
            </p>
            <p className="text-xs text-secondary-500">{student.admissionNo || student.admission_no}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (_value: unknown, student: Student, _index: number) => {
        return student.currentClass ? (
          <Badge variant="info">{getClassDisplayName(student.currentClass)}</Badge>
        ) : (
          <span className="text-secondary-400">-</span>
        );
      },
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (_value: unknown, student: Student, _index: number) => (
        <span className="text-secondary-700">{student.gender}</span>
      ),
    },
    {
      key: 'date_of_birth',
      header: 'Date of Birth',
      render: (_value: unknown, student: Student, _index: number) => (
        <span className="text-secondary-700">{formatDate(student.dateOfBirth || student.date_of_birth || '')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_value: unknown, student: Student, _index: number) => (
        <Badge className={STATUS_COLORS[student.status]}>{student.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: unknown, student: Student, _index: number) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard/students/${student.id}`)}
            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManageStudents && (
            <>
              <button
                onClick={() => handleEdit(student)}
                className="p-2 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(student)}
                className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Students</h1>
          <p className="text-secondary-500 mt-1">
            Manage and view all students in the school
          </p>
        </div>
        {canManageStudents && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            Add New Student
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Total Students</p>
              <p className="text-xl font-bold text-secondary-900">{isLoading ? '-' : stats.total}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Active</p>
              <p className="text-xl font-bold text-secondary-900">{isLoading ? '-' : stats.active}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Male</p>
              <p className="text-xl font-bold text-secondary-900">{isLoading ? '-' : stats.male}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Female</p>
              <p className="text-xl font-bold text-secondary-900">{isLoading ? '-' : stats.female}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              options={classOptions}
              value={classFilter}
              onChange={setClassFilter}
              placeholder="All Classes"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
            />
            <div className="relative export-dropdown">
              <Button 
                variant="outline" 
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!students.length || isLoading}
              >
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-10">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <FileText className="h-4 w-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 rounded-b-lg"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Results info */}
      <div className="text-sm text-secondary-500">
        {isLoading ? 'Loading...' : `Showing ${students.length} of ${meta.total} student${meta.total !== 1 ? 's' : ''}`}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="danger">
          Failed to load students. Please try again.
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && students.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No students found</h3>
            <p className="text-secondary-500 mb-4">
              {searchQuery || classFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first student'}
            </p>
            {canManageStudents && !searchQuery && !classFilter && !statusFilter && (
              <Button onClick={handleAdd} leftIcon={<Plus className="h-4 w-4" />}>
                Add Student
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      {!isLoading && !error && students.length > 0 && (
        <Table<Student>
          columns={columns}
          data={students}
          keyExtractor={(student) => student.id}
          onRowClick={(student) => navigate(`/dashboard/students/${student.id}`)}
          hoverable
        />
      )}

      {/* Pagination */}
      {!isLoading && meta.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
          totalItems={meta.total}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Student Form Modal */}
      <StudentForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          refetch();
        }}
        student={selectedStudent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        size="sm"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          Are you sure you want to delete{' '}
          <strong>
            {selectedStudent
              ? getFullName(selectedStudent.first_name, selectedStudent.last_name)
              : ''}
          </strong>
          ? This action cannot be undone.
        </Alert>
        {deleteMutation.isError && (
          <Alert variant="danger" className="mt-4">
            Failed to delete student. Please try again.
          </Alert>
        )}
      </Modal>
    </div>
  );
};

export default StudentList;
