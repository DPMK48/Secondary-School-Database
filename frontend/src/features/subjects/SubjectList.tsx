import React, { useState, useMemo } from 'react';
import { useRole } from '../../hooks/useRole';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardContent,
  Table,
  Badge,
  Modal,
  Alert,
} from '../../components/common';
import {
  mockSubjects,
  mockTeacherSubjectAssignments,
  mockTeachers,
  mockClasses,
  getClassDisplayName,
} from '../../utils/mockData';
import type { Subject } from '../../types';
import { Search, Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';

const SubjectList: React.FC = () => {
  const { canManageSubjects } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // New subject form state
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    level: '',
  });

  // Get teachers for a subject
  const getSubjectTeachers = (subjectId: number) => {
    const assignments = mockTeacherSubjectAssignments.filter((a) => a.subject_id === subjectId);
    const teacherIds = [...new Set(assignments.map((a) => a.teacher_id))];
    return teacherIds.map((id) => mockTeachers.find((t) => t.id === id)).filter(Boolean);
  };

  // Get classes for a subject
  const getSubjectClasses = (subjectId: number) => {
    const assignments = mockTeacherSubjectAssignments.filter((a) => a.subject_id === subjectId);
    const classIds = [...new Set(assignments.map((a) => a.class_id))];
    return classIds.map((id) => mockClasses.find((c) => c.id === id)).filter(Boolean);
  };

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    return mockSubjects.filter((subject) => {
      const matchesSearch =
        !searchQuery ||
        subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.subject_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = !levelFilter || subject.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, levelFilter]);

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setNewSubject({
      name: subject.subject_name,
      code: subject.subject_code,
      level: subject.level || '',
    });
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting subject:', selectedSubject?.id);
    setShowDeleteModal(false);
    setSelectedSubject(null);
  };

  const handleAddSubject = () => {
    if (selectedSubject) {
      console.log('Updating subject:', selectedSubject.id, newSubject);
    } else {
      console.log('Adding subject:', newSubject);
    }
    setShowAddModal(false);
    setNewSubject({ name: '', code: '', level: '' });
    setSelectedSubject(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewSubject({ name: '', code: '', level: '' });
    setSelectedSubject(null);
  };

  const levelOptions = [
    { value: 'Junior', label: 'Junior Secondary' },
    { value: 'Senior', label: 'Senior Secondary' },
    { value: 'All', label: 'All Levels' },
  ];

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (_value: unknown, row: Subject) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-900">{row.subject_name}</p>
            <p className="text-xs text-secondary-500">{row.subject_code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (_value: unknown, row: Subject) => (
        <Badge
          variant={row.level === 'Senior' ? 'primary' : row.level === 'Junior' ? 'info' : 'secondary'}
          size="sm"
        >
          {row.level}
        </Badge>
      ),
    },
    {
      key: 'teachers',
      label: 'Teachers',
      render: (_value: unknown, row: Subject) => {
        const teachers = getSubjectTeachers(row.id);
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-secondary-400" />
            <span className="text-sm">{teachers.length}</span>
          </div>
        );
      },
    },
    {
      key: 'classes',
      label: 'Classes',
      render: (_value: unknown, row: Subject) => {
        const classes = getSubjectClasses(row.id);
        return (
          <div className="flex flex-wrap gap-1">
            {classes.slice(0, 3).map((cls, index) =>
              cls ? (
                <Badge key={index} variant="default" size="sm">
                  {getClassDisplayName(cls)}
                </Badge>
              ) : null
            )}
            {classes.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{classes.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Subject) =>
        canManageSubjects ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
              <Trash2 className="h-4 w-4 text-danger-500" />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Subjects</h1>
          <p className="text-secondary-500 mt-1">Manage all subjects and their configurations</p>
        </div>
        {canManageSubjects && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModal(true)}>
            Add Subject
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Total Subjects</p>
            <p className="text-2xl font-bold text-secondary-900">{mockSubjects.length}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Junior Subjects</p>
            <p className="text-2xl font-bold text-blue-600">
              {mockSubjects.filter((s) => s.level === 'Junior').length}
            </p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Senior Subjects</p>
            <p className="text-2xl font-bold text-purple-600">
              {mockSubjects.filter((s) => s.level === 'Senior').length}
            </p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">All Levels</p>
            <p className="text-2xl font-bold text-green-600">
              {mockSubjects.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search subjects..."
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
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={filteredSubjects}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No subjects found"
          />
        </CardContent>
      </Card>

      {/* Add/Edit Subject Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={selectedSubject ? 'Edit Subject' : 'Add New Subject'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleAddSubject}>
              {selectedSubject ? 'Update Subject' : 'Add Subject'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g., Mathematics"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
          />
          <Input
            label="Subject Code"
            placeholder="e.g., MTH"
            value={newSubject.code}
            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
          />
          <Select
            label="Level"
            options={levelOptions}
            value={newSubject.level}
            onChange={(value) => setNewSubject({ ...newSubject, level: value })}
            placeholder="Select level"
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subject"
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
          Are you sure you want to delete <strong>{selectedSubject?.subject_name}</strong>? This will
          remove it from all classes.
        </Alert>
      </Modal>
    </div>
  );
};

export default SubjectList;
