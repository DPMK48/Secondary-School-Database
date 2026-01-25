import React, { useState, useMemo } from 'react';
import { useRole } from '../../hooks/useRole';
import {
  useSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '../../hooks/useSubjects';
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
  useToast,
  Spinner,
} from '../../components/common';
import type { Subject } from '../../types';
import { Search, Plus, Edit, Trash2, BookOpen } from 'lucide-react';

const SubjectList: React.FC = () => {
  const { canManageSubjects } = useRole();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API queries and mutations
  const { data, isLoading, error } = useSubjectsQuery({
    search: searchQuery || undefined,
    level: (levelFilter && levelFilter !== '' && levelFilter !== 'All') ? levelFilter as any : undefined,
    page,
    perPage,
  });

  const createMutation = useCreateSubjectMutation();
  const updateMutation = useUpdateSubjectMutation();
  const deleteMutation = useDeleteSubjectMutation();

  // New subject form state
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    level: '',
  });

  const subjects = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, perPage: 10, totalPages: 0 };

  // Debug logging
  React.useEffect(() => {
    if (data) {
      console.log('Subjects data:', data);
      console.log('Subjects array:', subjects);
    }
    if (error) {
      console.error('Subjects error:', error);
    }
  }, [data, error, subjects]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: meta.total,
      junior: subjects.filter((s: Subject) => s.level === 'Junior').length,
      senior: subjects.filter((s: Subject) => s.level === 'Senior').length,
    };
  }, [subjects, meta.total]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!newSubject.name.trim()) {
      newErrors.name = 'Subject name is required';
    }
    if (!newSubject.code.trim()) {
      newErrors.code = 'Subject code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setNewSubject({
      name: subject.subjectName,
      code: subject.subjectCode,
      level: subject.level || '',
    });
    setShowAddModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubject) return;

    try {
      await deleteMutation.mutateAsync(selectedSubject.id);
      toast.success(`${selectedSubject.subjectName} deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedSubject(null);
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete subject';
      toast.error(errorMessage);
    }
  };

  const handleAddSubject = async () => {
    if (!validate()) {
      return;
    }

    try {
      const dataToSave: any = {
        subjectName: newSubject.name,
        subjectCode: newSubject.code.toUpperCase(),
      };

      if (newSubject.level && newSubject.level !== 'All' && newSubject.level !== '') {
        dataToSave.level = newSubject.level;
      }

      if (selectedSubject) {
        await updateMutation.mutateAsync({ id: selectedSubject.id, data: dataToSave });
        toast.success(`${newSubject.name} updated successfully!`);
      } else {
        await createMutation.mutateAsync(dataToSave);
        toast.success(`${newSubject.name} added successfully!`);
      }

      setShowAddModal(false);
      setNewSubject({ name: '', code: '', level: '' });
      setSelectedSubject(null);
      setErrors({});
    } catch (error: any) {
      console.error('Error saving subject:', error);
      
      // Better error handling
      let errorMessage = 'Failed to save subject';
      
      if (error?.response?.data?.message) {
        const msg = error.response.data.message;
        if (Array.isArray(msg)) {
          errorMessage = msg.join(', ');
        } else {
          errorMessage = msg;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show specific error for duplicate subject code
      if (error?.response?.status === 409) {
        errorMessage = 'Subject code already exists. Please use a different code.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewSubject({ name: '', code: '', level: '' });
    setSelectedSubject(null);
    setErrors({});
  };

  const handleFieldChange = (field: string, value: string) => {
    setNewSubject({ ...newSubject, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
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
            <p className="font-medium text-secondary-900">{row.subjectName}</p>
            <p className="text-xs text-secondary-500">{row.subjectCode}</p>
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
          {row.level || 'All Levels'}
        </Badge>
      ),
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Total Subjects</p>
            <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Junior Subjects</p>
            <p className="text-2xl font-bold text-blue-600">{stats.junior}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-xs text-secondary-500">Senior Subjects</p>
            <p className="text-2xl font-bold text-purple-600">{stats.senior}</p>
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Alert variant="error">Failed to load subjects. Please try again.</Alert>
          ) : (
            <Table
              columns={columns}
              data={subjects}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No subjects found"
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Subject Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={selectedSubject ? 'Edit Subject' : 'Add New Subject'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g., Mathematics"
            value={newSubject.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g., MTH"
            value={newSubject.code}
            onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
            error={errors.code}
            required
          />
          <Select
            label="Level (Optional)"
            options={levelOptions}
            value={newSubject.level}
            onChange={(value) => handleFieldChange('level', value)}
            placeholder="Select level"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSubject}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : selectedSubject
              ? 'Update Subject'
              : 'Add Subject'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subject"
        size="sm"
      >
        <Alert variant="warning">
          Are you sure you want to delete <strong>{selectedSubject?.subjectName}</strong>? This action
          cannot be undone.
        </Alert>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectList;
