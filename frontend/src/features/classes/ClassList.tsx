import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { Button, Input, Select, Card, CardContent, Badge, Modal, Alert } from '../../components/common';
import { mockClasses, mockStudents, mockFormTeachers, mockTeachers, getClassDisplayName } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import type { Class } from '../../types';
import { Search, Plus, Users, GraduationCap, Eye, Edit, Trash2 } from 'lucide-react';

const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const { canManageClasses } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return mockClasses.filter((cls) => {
      const matchesSearch =
        !searchQuery ||
        getClassDisplayName(cls).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = !levelFilter || cls.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, levelFilter]);

  // Get form teacher for a class
  const getFormTeacher = (classId: number) => {
    const ft = mockFormTeachers.find((f) => f.class_id === classId);
    if (!ft) return null;
    return mockTeachers.find((t) => t.id === ft.teacher_id);
  };

  // Get student count for a class
  const getStudentCount = (classId: number) => {
    return mockStudents.filter((s) => s.current_class_id === classId).length;
  };

  const handleDelete = (cls: Class) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting class:', selectedClass?.id);
    setShowDeleteModal(false);
    setSelectedClass(null);
  };

  const levelOptions = [
    { value: 'Junior', label: 'Junior Secondary' },
    { value: 'Senior', label: 'Senior Secondary' },
  ];

  // Group classes by level
  const juniorClasses = filteredClasses.filter((c) => c.level === 'Junior');
  const seniorClasses = filteredClasses.filter((c) => c.level === 'Senior');

  const ClassCard: React.FC<{ cls: Class }> = ({ cls }) => {
    const formTeacher = getFormTeacher(cls.id);
    const studentCount = getStudentCount(cls.id);

    return (
      <Card hoverable onClick={() => navigate(`/dashboard/classes/${cls.id}`)}>
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {getClassDisplayName(cls)}
              </h3>
              <Badge variant={cls.level === 'Senior' ? 'primary' : 'info'} size="sm">
                {cls.level}
              </Badge>
            </div>
            {canManageClasses && (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/classes/${cls.id}/edit`);
                  }}
                  className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cls);
                  }}
                  className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-secondary-600">
              <Users className="h-4 w-4 text-secondary-400" />
              <span className="text-sm">{studentCount} Students</span>
            </div>

            {formTeacher && (
              <div className="flex items-center gap-2 text-secondary-600">
                <GraduationCap className="h-4 w-4 text-secondary-400" />
                <span className="text-sm">
                  Form Teacher: {getFullName(formTeacher.first_name, formTeacher.last_name)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-secondary-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/classes/${cls.id}`);
              }}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Classes</h1>
          <p className="text-secondary-500 mt-1">
            Manage all classes and their configurations
          </p>
        </div>
        {canManageClasses && (
          <Button leftIcon={<Plus className="h-4 w-4" />}>Add New Class</Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Total Classes</p>
            <p className="text-2xl font-bold text-secondary-900">{mockClasses.length}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Junior Classes</p>
            <p className="text-2xl font-bold text-blue-600">
              {mockClasses.filter((c) => c.level === 'Junior').length}
            </p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Senior Classes</p>
            <p className="text-2xl font-bold text-purple-600">
              {mockClasses.filter((c) => c.level === 'Senior').length}
            </p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Total Students</p>
            <p className="text-2xl font-bold text-green-600">{mockStudents.length}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>
          <Select
            options={levelOptions}
            value={levelFilter}
            onChange={setLevelFilter}
            placeholder="All Levels"
          />
        </div>
      </Card>

      {/* Junior Classes */}
      {(!levelFilter || levelFilter === 'Junior') && juniorClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Junior Secondary School
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {juniorClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      )}

      {/* Senior Classes */}
      {(!levelFilter || levelFilter === 'Senior') && seniorClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Senior Secondary School
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seniorClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      )}

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary-500">No classes found</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Class"
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
          <strong>{selectedClass ? getClassDisplayName(selectedClass) : ''}</strong>? This will
          affect all students in this class.
        </Alert>
      </Modal>
    </div>
  );
};

export default ClassList;
