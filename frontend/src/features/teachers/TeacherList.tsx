import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useDebounce } from '../../hooks/useDebounce';
import { Button, Input, Table, Pagination, Badge, Avatar, Card, Modal, Alert } from '../../components/common';
import { mockTeachers, mockTeacherSubjectAssignments, mockFormTeachers, mockSubjects, mockClasses, getClassDisplayName } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import type { Teacher } from '../../types';
import { Search, Plus, Eye, Trash2, GraduationCap, BookOpen, School, Edit } from 'lucide-react';
import TeacherForm from './TeacherForm';

const TeacherList: React.FC = () => {
  const navigate = useNavigate();
  const { canManageTeachers } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const itemsPerPage = 10;

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return mockTeachers.filter((teacher) => {
      return (
        !debouncedSearch ||
        getFullName(teacher.first_name, teacher.last_name)
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        teacher.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    });
  }, [debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get teacher's assignments
  const getTeacherAssignments = (teacherId: number) => {
    return mockTeacherSubjectAssignments.filter((a) => a.teacher_id === teacherId);
  };

  // Get form teacher's class
  const getFormTeacherClass = (teacherId: number) => {
    const ft = mockFormTeachers.find((f) => f.teacher_id === teacherId);
    if (!ft) return null;
    return mockClasses.find((c) => c.id === ft.class_id);
  };

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleAssign = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignModal(true);
  };

  const handleAdd = () => {
    setSelectedTeacher(null);
    setShowFormModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowFormModal(true);
  };

  const handleSaveTeacher = (data: Partial<Teacher>) => {
    if (selectedTeacher) {
      console.log('Updating teacher:', selectedTeacher.id, data);
      // TODO: Call API to update teacher
    } else {
      console.log('Creating new teacher:', data);
      // TODO: Call API to create teacher
    }
    setShowFormModal(false);
  };

  const confirmDelete = () => {
    console.log('Deleting teacher:', selectedTeacher?.id);
    setShowDeleteModal(false);
    setSelectedTeacher(null);
  };

  const columns = [
    {
      key: 'teacher',
      header: 'Teacher',
      render: (_value: unknown, teacher: Teacher, _index: number) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={teacher.first_name} lastName={teacher.last_name} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(teacher.first_name, teacher.last_name)}
            </p>
            <p className="text-xs text-secondary-500">{teacher.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (_value: unknown, teacher: Teacher, _index: number) => (
        <span className="text-secondary-700">{teacher.phone}</span>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (_value: unknown, teacher: Teacher, _index: number) => {
        const assignments = getTeacherAssignments(teacher.id);
        const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
        const subjects = subjectIds.map((id) =>
          mockSubjects.find((s) => s.id === id)?.subject_name
        );
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.slice(0, 2).map((subject, i) => (
              <Badge key={i} variant="info" size="sm">
                {subject}
              </Badge>
            ))}
            {subjects.length > 2 && (
              <Badge variant="default" size="sm">
                +{subjects.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'classes',
      header: 'Classes',
      render: (_value: unknown, teacher: Teacher, _index: number) => {
        const assignments = getTeacherAssignments(teacher.id);
        const classIds = [...new Set(assignments.map((a) => a.class_id))];
        return (
          <span className="text-secondary-700">
            {classIds.length} class{classIds.length !== 1 ? 'es' : ''}
          </span>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (_value: unknown, teacher: Teacher, _index: number) => {
        const formTeacherClass = getFormTeacherClass(teacher.id);
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="primary" size="sm">Subject Teacher</Badge>
            {formTeacherClass && (
              <Badge variant="success" size="sm">
                Form Teacher ({getClassDisplayName(formTeacherClass)})
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: unknown, teacher: Teacher, _index: number) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/teachers/${teacher.id}`);
            }}
            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManageTeachers && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(teacher);
                }}
                className="p-2 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssign(teacher);
                }}
                className="p-2 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Assign Subjects"
              >
                <BookOpen className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(teacher);
                }}
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
          <h1 className="text-2xl font-bold text-secondary-900">Teachers</h1>
          <p className="text-secondary-500 mt-1">
            Manage teachers and their subject assignments
          </p>
        </div>
        {canManageTeachers && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            Add New Teacher
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Total Teachers</p>
              <p className="text-xl font-bold text-secondary-900">{mockTeachers.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <School className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Form Teachers</p>
              <p className="text-xl font-bold text-secondary-900">{mockFormTeachers.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Subjects</p>
              <p className="text-xl font-bold text-secondary-900">{mockSubjects.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <School className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Classes</p>
              <p className="text-xl font-bold text-secondary-900">{mockClasses.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedTeachers}
        keyExtractor={(teacher) => teacher.id}
        hoverable
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTeachers.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Teacher"
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
            {selectedTeacher
              ? getFullName(selectedTeacher.first_name, selectedTeacher.last_name)
              : ''}
          </strong>
          ? This action cannot be undone.
        </Alert>
      </Modal>

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
      />

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Subjects"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Assign subjects and classes to{' '}
            <strong>
              {selectedTeacher
                ? getFullName(selectedTeacher.first_name, selectedTeacher.last_name)
                : ''}
            </strong>
          </p>
          <Alert variant="info">
            Subject assignment feature coming soon. This will allow you to assign multiple
            subjects and classes to a teacher.
          </Alert>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherList;
