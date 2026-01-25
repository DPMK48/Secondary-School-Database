import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card,
  Button, 
  Alert, 
  Spinner, 
  Badge,
  Modal
} from '../../components/common';
import { Plus, Trash2, Check, X, ArrowLeft } from 'lucide-react';
import { 
  useTeacherQuery, 
  useTeacherAssignmentsQuery,
  useAssignSubjectClassMutation,
  useUnassignSubjectClassMutation 
} from '../../hooks/useTeachers';
import { useSubjectsQuery } from '../../hooks/useSubjects';
import { useClassesQuery } from '../../hooks/useClasses';

const AssignSubjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teacherId = parseInt(id || '0');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch teacher data
  const { data: teacherResponse, isLoading: teacherLoading } = useTeacherQuery(teacherId, {
    enabled: !!teacherId,
  });

  // Fetch teacher's assignments
  const { data: assignmentsResponse, isLoading: assignmentsLoading, refetch: refetchAssignments } = useTeacherAssignmentsQuery(teacherId, {
    enabled: !!teacherId,
  });

  // Fetch all subjects
  const { data: subjectsResponse, isLoading: subjectsLoading } = useSubjectsQuery({ perPage: 100 });

  // Fetch all classes
  const { data: classesResponse, isLoading: classesLoading } = useClassesQuery({ perPage: 100 });

  // Mutations
  const assignMutation = useAssignSubjectClassMutation();
  const unassignMutation = useUnassignSubjectClassMutation();

  // Normalize teacher data
  const teacher = useMemo(() => {
    const data = teacherResponse?.data;
    if (!data) return null;
    return {
      id: data.id,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      email: data.email,
    };
  }, [teacherResponse]);

  // Normalize assignments
  const assignments = useMemo(() => {
    const data = assignmentsResponse?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((a: any) => ({
      id: a.id,
      subject: a.subject ? {
        id: a.subject.id,
        subjectName: a.subject.subjectName || a.subject.subject_name,
        subjectCode: a.subject.subjectCode || a.subject.subject_code,
      } : null,
      class: a.class ? {
        id: a.class.id,
        className: a.class.className || a.class.class_name,
        arm: a.class.arm,
        level: a.class.level,
      } : null,
    }));
  }, [assignmentsResponse]);

  // Normalize subjects
  const subjects = useMemo(() => {
    const data = subjectsResponse?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((s: any) => ({
      id: s.id,
      subjectName: s.subjectName || s.subject_name,
      subjectCode: s.subjectCode || s.subject_code,
    }));
  }, [subjectsResponse]);

  // Normalize classes
  const classes = useMemo(() => {
    const data = classesResponse?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((c: any) => ({
      id: c.id,
      className: c.className || c.class_name,
      arm: c.arm,
      level: c.level,
    }));
  }, [classesResponse]);

  const getClassDisplayName = (cls: { className: string; arm: string }) => {
    return `${cls.className} ${cls.arm}`;
  };

  const handleAddAssignment = async () => {
    if (!selectedSubject || !selectedClass) {
      setError('Please select both subject and class');
      return;
    }

    setError('');

    try {
      await assignMutation.mutateAsync({
        teacherId,
        subjectId: parseInt(selectedSubject),
        classId: parseInt(selectedClass),
      });

      setSuccess('Assignment added successfully');
      setSelectedSubject('');
      setSelectedClass('');
      setShowAddModal(false);
      refetchAssignments();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add assignment');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignmentId) return;

    setError('');

    try {
      await unassignMutation.mutateAsync(selectedAssignmentId);
      setSuccess('Assignment removed successfully');
      setShowDeleteModal(false);
      setSelectedAssignmentId(null);
      refetchAssignments();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to remove assignment');
    }
  };

  const openDeleteModal = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setShowDeleteModal(true);
  };

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

  const isLoading = teacherLoading || assignmentsLoading || subjectsLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6">
        <Alert variant="error">Teacher not found</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assign Subjects & Classes</h1>
            <p className="text-gray-600 mt-1">
              Teacher: <strong>{teacher.firstName} {teacher.lastName}</strong>
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Alerts */}
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Assignments Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Current Assignments ({assignments.length})</h3>
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No assignments yet. Click "Add Assignment" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment, index) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {assignment.subject?.subjectName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {assignment.subject?.subjectCode}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {assignment.class && getClassDisplayName(assignment.class)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={assignment.class?.level === 'Senior' ? 'primary' : 'info'}>
                          {assignment.class?.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Add Assignment Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => !assignMutation.isPending && setShowAddModal(false)}
        title="Add New Assignment"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={assignMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddAssignment} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {assignMutation.isPending ? 'Adding...' : 'Add Assignment'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={assignMutation.isPending}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subjectName} ({subject.subjectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={assignMutation.isPending}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {getClassDisplayName(cls)} ({cls.level})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => !unassignMutation.isPending && setShowDeleteModal(false)}
        title="Remove Assignment"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={unassignMutation.isPending}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAssignment} disabled={unassignMutation.isPending}>
              {unassignMutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {unassignMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to remove the assignment for{' '}
          <strong>{selectedAssignment?.subject?.subjectName}</strong> in{' '}
          <strong>{selectedAssignment?.class && getClassDisplayName(selectedAssignment.class)}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default AssignSubjects;
