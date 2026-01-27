import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { Button, Input, Table, Pagination, Badge, Avatar, Card, Modal, Alert, CredentialsModal } from '../../components/common';
import { getClassDisplayName } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import type { Teacher } from '../../types';
import { Search, Plus, Eye, Trash2, GraduationCap, BookOpen, School } from 'lucide-react';
import TeacherForm from './TeacherForm';
import { useTeachersQuery, useDeleteTeacherMutation } from '../../hooks/useTeachers';

// School code for credential generation
const SCHOOL_CODE = 'ESS001'; // Excellence Secondary School

// Generate teacher credentials
const generateCredentials = (email: string) => {
  const username = email.split('@')[0];
  const currentYear = new Date().getFullYear();
  const password = `${SCHOOL_CODE}@${currentYear}`;
  return { username, password };
};

const TeacherList: React.FC = () => {
  const navigate = useNavigate();
  const { impersonate } = useAuth();
  const { canManageTeachers, isAuthenticated, token } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showConfirmLoginModal, setShowConfirmLoginModal] = useState(false);
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    teacherEmail: string;
    teacherName: string;
  } | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const itemsPerPage = 10;

  // Fetch teachers with filters - only if authenticated
  const { data: teachersData, isLoading, error } = useTeachersQuery({
    search: debouncedSearch,
    page: currentPage,
    perPage: itemsPerPage,
  }, { enabled: isAuthenticated && !!token });

  // Delete mutation
  const deleteMutation = useDeleteTeacherMutation();

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const teachers = teachersData?.data || [];
  const totalPages = teachersData?.meta ? Math.ceil(teachersData.meta.total / itemsPerPage) : 1;

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;
    
    try {
      await deleteMutation.mutateAsync(selectedTeacher.id);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error('Failed to delete teacher:', error);
    }
  };

  const performImpersonation = (teacher: Teacher, role: string) => {
    // Create user object for impersonation
    const impersonatedUser = {
      id: teacher.user_id || teacher.id,
      username: teacher.email.split('@')[0],
      email: teacher.email,
      role: role as 'Form Teacher' | 'Subject Teacher',
      is_active: true,
    };
    
    // Call impersonate function from auth store
    if (impersonate) {
      impersonate(impersonatedUser);
      navigate('/dashboard');
    }
  };

  const confirmLogin = async () => {
    if (!selectedTeacher || !pendingRole) return;
    
    try {
      // Perform impersonation with selected role
      performImpersonation(selectedTeacher, pendingRole);
      setShowConfirmLoginModal(false);
      setSelectedTeacher(null);
      setPendingRole(null);
    } catch (error) {
      console.error('Failed to login as teacher:', error);
    }
  };

  const handleLoginAs = (teacher: any) => {
    // Normalize teacher data
    const normalizedTeacher = {
      ...teacher,
      first_name: teacher.first_name || teacher.firstName,
      last_name: teacher.last_name || teacher.lastName,
      staff_id: teacher.staff_id || teacher.staffId,
      // Store form teacher status
      isFormTeacher: (teacher.user?.role?.roleName || teacher.user?.role?.role_name) === 'Form Teacher',
    };
    setSelectedTeacher(normalizedTeacher);
    // Always show role selection modal
    setShowRoleSelectionModal(true);
  };

  const columns = [
    {
      key: 'teacher',
      header: 'Teacher',
      render: (_value: unknown, teacher: any, _index: number) => {
        // Handle both camelCase and snake_case from API
        const firstName = teacher.first_name || teacher.firstName;
        const lastName = teacher.last_name || teacher.lastName;
        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={firstName} lastName={lastName} size="sm" />
            <div>
              <p className="font-medium text-secondary-900">
                {getFullName(firstName, lastName)}
              </p>
              <p className="text-xs text-secondary-500">{teacher.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (_value: unknown, teacher: Teacher, _index: number) => (
        <span className="text-secondary-700">{teacher.phone}</span>
      ),
    },
    {
      key: 'staff_id',
      header: 'Staff ID',
      render: (_value: unknown, teacher: any, _index: number) => (
        <span className="text-secondary-700">{teacher.staff_id || teacher.staffId || 'N/A'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: unknown, teacher: any, _index: number) => (
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Normalize teacher data before passing
                const normalizedTeacher = {
                  ...teacher,
                  first_name: teacher.first_name || teacher.firstName,
                  last_name: teacher.last_name || teacher.lastName,
                  staff_id: teacher.staff_id || teacher.staffId,
                };
                handleDelete(normalizedTeacher);
              }}
              className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedTeacher(null);
    setShowFormModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowFormModal(true);
  };

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
              <p className="text-xl font-bold text-secondary-900">{teachersData?.meta?.total || 0}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <School className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Active Teachers</p>
              <p className="text-xl font-bold text-secondary-900">{teachers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-secondary-600">Loading teachers...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          Failed to load teachers. Please try again.
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          {/* Search and Table */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-5 w-5" />}
                  />
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={teachers}
              keyExtractor={(teacher) => teacher.id}
              hoverable
            />
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={teachersData?.meta?.total || 0}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
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
              ? getFullName(
                  selectedTeacher.first_name || (selectedTeacher as any).firstName,
                  selectedTeacher.last_name || (selectedTeacher as any).lastName
                )
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
      />

      {/* Credentials Modal */}
      {generatedCredentials && (
        <CredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setGeneratedCredentials(null);
          }}
          credentials={{
            username: generatedCredentials.username,
            password: generatedCredentials.password,
          }}
          teacherEmail={generatedCredentials.teacherEmail}
          teacherName={generatedCredentials.teacherName}
          role="subject_teacher"
          emailSent={true}
        />
      )}

      {/* Confirm Login Modal */}
      <Modal
        isOpen={showConfirmLoginModal}
        onClose={() => {
          setShowConfirmLoginModal(false);
          setSelectedTeacher(null);
          setPendingRole(null);
        }}
        title="Confirm Impersonation"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmLoginModal(false);
                setSelectedTeacher(null);
                setPendingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmLogin}>
              Confirm Login
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="warning">
            You are about to log in as <strong>{selectedTeacher && getFullName(selectedTeacher.first_name, selectedTeacher.last_name)}</strong> with the role of <strong>{pendingRole}</strong>.
          </Alert>
          <p className="text-sm text-gray-600">
            This will switch your account view to the teacher's perspective. You can return to your admin account at any time using the "Exit Impersonation" button.
          </p>
        </div>
      </Modal>

      {/* Role Selection Modal */}
      <Modal
        isOpen={showRoleSelectionModal}
        onClose={() => {
          setShowRoleSelectionModal(false);
          setSelectedTeacher(null);
        }}
        title="Login As Teacher"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {(selectedTeacher as any)?.isFormTeacher ? (
              <>
                <strong>{selectedTeacher && getFullName(selectedTeacher.first_name, selectedTeacher.last_name)}</strong> has both Subject Teacher and Form Teacher roles.
                Please select which role you want to impersonate:
              </>
            ) : (
              <>
                You are about to login as <strong>{selectedTeacher && getFullName(selectedTeacher.first_name, selectedTeacher.last_name)}</strong> (Subject Teacher).
                This will switch your account view to the teacher's perspective.
              </>
            )}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                if (selectedTeacher) {
                  performImpersonation(selectedTeacher, 'Subject Teacher');
                  setShowRoleSelectionModal(false);
                  setSelectedTeacher(null);
                }
              }}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Subject Teacher</p>
                  <p className="text-xs text-gray-500">Access to assigned subjects and classes</p>
                </div>
              </div>
            </button>

            {(selectedTeacher as any)?.isFormTeacher && (
              <button
                onClick={() => {
                  if (selectedTeacher) {
                    performImpersonation(selectedTeacher, 'Form Teacher');
                    setShowRoleSelectionModal(false);
                    setSelectedTeacher(null);
                  }
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                    <School className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Form Teacher</p>
                    <p className="text-xs text-gray-500">Access to form class management</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherList;
