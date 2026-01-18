import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge, Modal, Alert } from '../../components/common';
import { mockClasses, mockStudents, mockFormTeachers, mockTeachers, getClassDisplayName, mockTeacherSubjectAssignments, mockSubjects } from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import type { Class, ClassArm, ClassLevel } from '../../types';
import { Search, Plus, Users, GraduationCap, Eye, Edit, Trash2, School, BookOpen } from 'lucide-react';

const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canManageClasses } = useRole();
  const isSubjectTeacher = user?.role === 'subject_teacher';
  const isFormTeacher = user?.role === 'form_teacher';

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // New class form state
  const [newClass, setNewClass] = useState({
    name: '',
    arm: 'A' as ClassArm,
    level: 'Junior' as ClassLevel,
    formTeacherId: '',
  });

  // Mock teacher ID (in real app, get from auth context)
  const teacherId = 1;

  // Get teacher's assigned classes and subjects
  const teacherAssignments = useMemo(() => {
    if (!isSubjectTeacher && !isFormTeacher) return [];
    return mockTeacherSubjectAssignments.filter((a) => a.teacher_id === teacherId);
  }, [isSubjectTeacher, isFormTeacher, teacherId]);

  // Get unique classes with subjects and student counts for teachers
  const myClasses = useMemo(() => {
    if (!isSubjectTeacher && !isFormTeacher) return [];
    
    const classMap = new Map<number, { class: any; subjects: any[]; studentCount: number }>();
    
    teacherAssignments.forEach((assignment) => {
      const classData = mockClasses.find((c) => c.id === assignment.class_id);
      const subject = mockSubjects.find((s) => s.id === assignment.subject_id);
      
      if (classData && subject) {
        const studentsInClass = mockStudents.filter(
          (s) => s.current_class_id === classData.id && s.status === 'Active'
        ).length;
        
        if (classMap.has(classData.id)) {
          const existing = classMap.get(classData.id)!;
          existing.subjects.push(subject);
        } else {
          classMap.set(classData.id, {
            class: classData,
            subjects: [subject],
            studentCount: studentsInClass,
          });
        }
      }
    });
    
    return Array.from(classMap.values());
  }, [teacherAssignments, isSubjectTeacher, isFormTeacher]);

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

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls);
    const formTeacher = getFormTeacher(cls.id);
    setNewClass({
      name: cls.class_name,
      arm: cls.arm,
      level: cls.level,
      formTeacherId: formTeacher ? formTeacher.id.toString() : '',
    });
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting class:', selectedClass?.id);
    setShowDeleteModal(false);
    setSelectedClass(null);
  };

  const handleAddClass = () => {
    if (selectedClass) {
      console.log('Updating class:', selectedClass.id, newClass);
    } else {
      console.log('Adding new class:', newClass);
    }
    setShowAddModal(false);
    setNewClass({ name: '', arm: 'A', level: 'Junior', formTeacherId: '' });
    setSelectedClass(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewClass({ name: '', arm: 'A', level: 'Junior', formTeacherId: '' });
    setSelectedClass(null);
  };

  const levelOptions = [
    { value: 'Junior', label: 'Junior Secondary' },
    { value: 'Senior', label: 'Senior Secondary' },
  ];

  const armOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  const classNameOptions = [
    { value: 'JSS 1', label: 'JSS 1' },
    { value: 'JSS 2', label: 'JSS 2' },
    { value: 'JSS 3', label: 'JSS 3' },
    { value: 'SS 1', label: 'SS 1' },
    { value: 'SS 2', label: 'SS 2' },
    { value: 'SS 3', label: 'SS 3' },
  ];

  const teacherOptions = mockTeachers.map((teacher) => ({
    value: teacher.id.toString(),
    label: getFullName(teacher.first_name, teacher.last_name),
  }));

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
                    handleEdit(cls);
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
          <h1 className="text-2xl font-bold text-secondary-900">
            {isSubjectTeacher || isFormTeacher ? 'My Classes' : 'Classes'}
          </h1>
          <p className="text-secondary-500 mt-1">
            {isSubjectTeacher || isFormTeacher
              ? 'View your assigned classes and subjects'
              : 'Manage all classes and their configurations'}
          </p>
        </div>
        {canManageClasses && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModal(true)}>
            Add New Class
          </Button>
        )}
      </div>

      {/* My Classes - For Form Teachers */}
      {isFormTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary-600" />
                My Class
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myClasses.length > 0 ? (
                myClasses.map((item) => (
                  <div
                    key={item.class.id}
                    className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors"
                    onClick={() => navigate(`/dashboard/classes/${item.class.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-secondary-900">
                        {getClassDisplayName(item.class)}
                      </p>
                      <Badge variant="primary">{item.studentCount} students</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <School className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
                  <p className="text-sm">No class assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Classes & Subjects - For Subject Teachers Only */}
      {isSubjectTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Classes */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary-600" />
                  My Classes
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myClasses.length > 0 ? (
                  myClasses.map((item) => (
                    <div
                      key={item.class.id}
                      className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 cursor-pointer hover:bg-secondary-100 transition-colors"
                      onClick={() => navigate(`/dashboard/classes/${item.class.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-secondary-900">
                          {getClassDisplayName(item.class)}
                        </p>
                        <Badge variant="primary">{item.studentCount} students</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-secondary-500 font-medium">Subjects:</p>
                        {item.subjects.map((subject) => (
                          <div
                            key={subject.id}
                            className="flex items-center gap-2 text-sm text-secondary-700"
                          >
                            <BookOpen className="h-3 w-3 text-primary-500" />
                            {subject.subject_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <School className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
                    <p className="text-sm">No classes assigned yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  My Subjects
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myClasses.length > 0 ? (
                  (() => {
                    const allSubjects = myClasses.flatMap((item) => item.subjects);
                    const uniqueSubjects = Array.from(
                      new Map(allSubjects.map((s) => [s.id, s])).values()
                    );
                    return uniqueSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg"
                      >
                        <BookOpen className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-secondary-900">{subject.subject_name}</p>
                          <p className="text-xs text-secondary-500">{subject.subject_code}</p>
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
                    <p className="text-sm">No subjects assigned yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats - Admin only */}
      {!isSubjectTeacher && !isFormTeacher && (
        <>
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
        </>
      )}

      {/* Add/Edit Class Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={selectedClass ? 'Edit Class' : 'Add New Class'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleAddClass}>
              {selectedClass ? 'Update Class' : 'Add Class'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Class Name"
            options={classNameOptions}
            value={newClass.name}
            onChange={(value) => setNewClass({ ...newClass, name: value })}
            placeholder="Select class"
          />
          <Select
            label="Arm"
            options={armOptions}
            value={newClass.arm}
            onChange={(value) => setNewClass({ ...newClass, arm: value as ClassArm })}
            placeholder="Select arm"
          />
          <Select
            label="Level"
            options={levelOptions}
            value={newClass.level}
            onChange={(value) => setNewClass({ ...newClass, level: value as ClassLevel })}
            placeholder="Select level"
          />
          <Select
            label="Form Teacher (Optional)"
            options={teacherOptions}
            value={newClass.formTeacherId}
            onChange={(value) => setNewClass({ ...newClass, formTeacherId: value })}
            placeholder="Select form teacher"
          />
        </div>
      </Modal>

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
