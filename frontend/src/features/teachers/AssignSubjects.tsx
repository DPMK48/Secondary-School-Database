import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card,
  Button, 
  Alert, 
  Spinner, 
  Badge,
  Modal
} from '../../components/common';
import { mockTeachers, mockSubjects, mockClasses, getClassDisplayName } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import type { Teacher, Subject, Class, TeacherSubjectClass } from '../../types';
import { Plus, Trash2, Check, X } from 'lucide-react';

const AssignSubjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<TeacherSubjectClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherSubjectClass | null>(null);
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundTeacher = mockTeachers.find((t) => t.id === parseInt(id || '0'));
      setTeacher(foundTeacher || null);
      setSubjects(mockSubjects);
      setClasses(mockClasses);
      // Mock assignments - in real app, fetch from teachersApi.getSubjects(id)
      setAssignments([]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddAssignment = async () => {
    if (!selectedSubject || !selectedClass) {
      setError('Please select both subject and class');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await teachersApi.assignSubjectClass({
      //   teacher_id: parseInt(id || '0'),
      //   subject_id: parseInt(selectedSubject),
      //   class_id: parseInt(selectedClass),
      // });

      // Mock success
      setTimeout(() => {
        const subject = subjects.find(s => s.id === parseInt(selectedSubject));
        const classData = classes.find(c => c.id === parseInt(selectedClass));
        
        const newAssignment: TeacherSubjectClass = {
          id: Date.now(),
          teacher_id: parseInt(id || '0'),
          subject_id: parseInt(selectedSubject),
          class_id: parseInt(selectedClass),
          subject,
          class: classData,
        };

        setAssignments([...assignments, newAssignment]);
        setSuccess('Assignment added successfully');
        setSelectedSubject('');
        setSelectedClass('');
        setShowAddModal(false);
        setSubmitting(false);

        setTimeout(() => setSuccess(''), 3000);
      }, 500);
    } catch (err) {
      setError('Failed to add assignment');
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await teachersApi.removeAssignment(selectedAssignment.id);

      // Mock success
      setTimeout(() => {
        setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
        setSuccess('Assignment removed successfully');
        setShowDeleteModal(false);
        setSelectedAssignment(null);
        setSubmitting(false);

        setTimeout(() => setSuccess(''), 3000);
      }, 500);
    } catch (err) {
      setError('Failed to remove assignment');
      setSubmitting(false);
    }
  };

  const openDeleteModal = (assignment: TeacherSubjectClass) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  if (loading) {
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
        <div>
          <h1 className="text-2xl font-bold">Assign Subjects & Classes</h1>
          <p className="text-gray-600 mt-1">
            Teacher: <strong>{getFullName(teacher.first_name, teacher.last_name)}</strong>
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Alerts */}
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

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
                        {assignment.subject?.subject_name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {assignment.subject?.subject_code}
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
                          onClick={() => openDeleteModal(assignment)}
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
        onClose={() => !submitting && setShowAddModal(false)}
        title="Add New Assignment"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddAssignment} disabled={submitting}>
              {submitting ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {submitting ? 'Adding...' : 'Add Assignment'}
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
              disabled={submitting}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name} ({subject.subject_code})
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
              disabled={submitting}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {getClassDisplayName(cls)}
                </option>
              ))}
            </select>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => !submitting && setShowDeleteModal(false)}
        title="Remove Assignment"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAssignment} disabled={submitting}>
              {submitting ? <Spinner size="sm" className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {submitting ? 'Removing...' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to remove the assignment for{' '}
          <strong>{selectedAssignment?.subject?.subject_name}</strong> in{' '}
          <strong>{selectedAssignment?.class && getClassDisplayName(selectedAssignment.class)}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default AssignSubjects;
