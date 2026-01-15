import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useDebounce } from '../../hooks/useDebounce';
import { Button, Input, Select, Table, Pagination, Badge, Avatar, Card, Modal, Alert } from '../../components/common';
import { mockStudents, mockClasses, getClassDisplayName } from '../../utils/mockData';
import { getFullName, formatDate } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import type { Student } from '../../types';
import { Search, Plus, Download, Eye, Edit, Trash2, Users } from 'lucide-react';
import StudentForm from './StudentForm';

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { canManageStudents } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const itemsPerPage = 10;

  // Filter students
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        !debouncedSearch ||
        getFullName(student.first_name, student.last_name)
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        student.admission_no.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesClass = !classFilter || student.current_class_id === parseInt(classFilter);
      const matchesStatus = !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [debouncedSearch, classFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleSaveStudent = (data: Partial<Student>) => {
    if (selectedStudent) {
      console.log('Updating student:', selectedStudent.id, data);
      // TODO: Call API to update student
    } else {
      console.log('Creating new student:', data);
      // TODO: Call API to create student
    }
    setShowFormModal(false);
  };

  const confirmDelete = () => {
    // In production, this would call the API
    console.log('Deleting student:', selectedStudent?.id);
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  const classOptions = mockClasses.map((c) => ({
    value: c.id,
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
          <Avatar firstName={student.first_name} lastName={student.last_name} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(student.first_name, student.last_name)}
            </p>
            <p className="text-xs text-secondary-500">{student.admission_no}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (_value: unknown, student: Student, _index: number) => {
        const cls = mockClasses.find((c) => c.id === student.current_class_id);
        return cls ? (
          <Badge variant="info">{getClassDisplayName(cls)}</Badge>
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
        <span className="text-secondary-700">{formatDate(student.date_of_birth)}</span>
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
              <p className="text-xl font-bold text-secondary-900">{mockStudents.length}</p>
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
              <p className="text-xl font-bold text-secondary-900">
                {mockStudents.filter((s) => s.status === 'Active').length}
              </p>
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
              <p className="text-xl font-bold text-secondary-900">
                {mockStudents.filter((s) => s.gender === 'Male').length}
              </p>
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
              <p className="text-xl font-bold text-secondary-900">
                {mockStudents.filter((s) => s.gender === 'Female').length}
              </p>
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
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Results info */}
      <div className="text-sm text-secondary-500">
        Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <Table<Student>
        columns={columns}
        data={paginatedStudents}
        keyExtractor={(student) => student.id}
        onRowClick={(student) => navigate(`/dashboard/students/${student.id}`)}
        hoverable
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Student Form Modal */}
      <StudentForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
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
      </Modal>
    </div>
  );
};

export default StudentList;
