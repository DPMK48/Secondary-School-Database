import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge, Modal, Table, Pagination } from '../../components/common';
import { Search, Plus, Users, GraduationCap, Eye, Edit, Trash2 } from 'lucide-react';
import { useClassesQuery, useDeleteClassMutation } from '../../hooks/useClasses';
import { useDebounce } from '../../hooks/useDebounce';
import ClassForm from './ClassForm';
import type { Class, ClassLevel } from '../../types';

const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const { canManageClasses } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch classes with filters
  const { data, isLoading, error, refetch } = useClassesQuery({
    search: debouncedSearch,
    level: (levelFilter as ClassLevel | undefined) || undefined,
    page: currentPage,
    perPage: itemsPerPage,
  });

  const deleteMutation = useDeleteClassMutation();

  const classes = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const handleDelete = (cls: Class) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedClass) {
      try {
        await deleteMutation.mutateAsync(selectedClass.id);
        setShowDeleteModal(false);
        setSelectedClass(null);
        refetch();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls);
    setShowFormModal(true);
  };

  const handleViewDetails = (cls: Class) => {
    navigate(`/dashboard/classes/${cls.id}`);
  };

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
  ];

  const columns = [
    {
      key: 'class_name',
      header: 'Class',
      render: (_value: unknown, cls: Class) => (
        <div>
          <div className="font-medium text-secondary-900">{cls.className || cls.class_name}</div>
          <div className="text-sm text-secondary-500">Arm {cls.arm}</div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (_value: unknown, cls: Class) => (
        <Badge variant={cls.level === 'Junior' ? 'info' : 'warning'}>
          {cls.level}
        </Badge>
      ),
    },
    {
      key: 'form_teacher',
      header: 'Form Teacher',
      render: (_value: unknown, cls: Class) => {
        const formTeacher = cls.form_teacher || (cls as any).formTeacher;
        return (
          <div>
            {formTeacher ? (
              <span className="font-medium text-secondary-900">
                {formTeacher.first_name || formTeacher.firstName} {formTeacher.last_name || formTeacher.lastName}
              </span>
            ) : (
              <span className="text-secondary-400 italic">No form teacher</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'student_count',
      header: 'Students',
      render: (_value: unknown, cls: Class) => (
        <div className="flex items-center text-secondary-600">
          <Users className="w-4 h-4 mr-1" />
          <span>{cls.students_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: unknown, cls: Class) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(cls)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {canManageClasses && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(cls)}
                title="Edit Class"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(cls)}
                title="Delete Class"
                className="text-error-600 hover:text-error-700 hover:bg-error-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Classes</h1>
          <p className="text-secondary-600 mt-1">Manage school classes and assignments</p>
        </div>
        {canManageClasses && (
          <Button onClick={() => {
            setSelectedClass(null);
            setShowFormModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={levelOptions}
                value={levelFilter}
                onChange={setLevelFilter}
                placeholder="Filter by level"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>All Classes</span>
              <span className="text-sm font-normal text-secondary-500">
                {meta.total} {meta.total === 1 ? 'class' : 'classes'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-secondary-500">Loading classes...</div>
          ) : error ? (
            <div className="text-center py-8 text-error-600">
              Error loading classes. Please try again.
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No classes found</h3>
              <p className="text-secondary-500 mb-6">
                {searchQuery || levelFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first class'}
              </p>
              {canManageClasses && !searchQuery && !levelFilter && (
                <Button onClick={() => {
                  setSelectedClass(null);
                  setShowFormModal(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Class
                </Button>
              )}
            </div>
          ) : (
            <Table 
              columns={columns} 
              data={classes} 
              keyExtractor={(cls: any) => cls.id.toString()} 
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
          totalItems={meta.total}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Class Form Modal */}
      <ClassForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedClass(null);
          refetch();
        }}
        classData={selectedClass}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Class"
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
        <p className="text-secondary-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{selectedClass?.class_name} {selectedClass?.arm}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ClassList;
