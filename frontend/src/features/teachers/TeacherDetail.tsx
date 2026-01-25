import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  Modal,
  Alert,
  Spinner,
} from '../../components/common';
import { getClassDisplayName } from '../../utils/mockData';
import { getFullName, formatDate } from '../../utils/helpers';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Award,
  Edit,
  LogIn,
  School,
} from 'lucide-react';
import TeacherForm from './TeacherForm';
import { useTeacherQuery, useTeacherAssignmentsQuery } from '../../hooks/useTeachers';
import { useClassesQuery } from '../../hooks/useClasses';
import type { Teacher } from '../../types';

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageTeachers } = useRole();
  const { impersonate } = useAuth();
  const [showFormModal, setShowFormModal] = useState(false);
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [showConfirmLoginModal, setShowConfirmLoginModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<'Form Teacher' | 'Subject Teacher' | null>(null);

  const teacherId = parseInt(id || '0');

  // Fetch teacher data from API
  const { data: teacherResponse, isLoading: teacherLoading, error: teacherError } = useTeacherQuery(teacherId, {
    enabled: !!teacherId,
  });

  // Get teacher data - normalize to snake_case for display
  const teacher: Teacher | null = useMemo(() => {
    const data = teacherResponse?.data;
    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id || data.userId,
      first_name: data.first_name || data.firstName,
      last_name: data.last_name || data.lastName,
      phone: data.phone,
      email: data.email,
      staff_id: data.staff_id || data.staffId,
      address: data.address,
      employment_date: data.employment_date || data.employmentDate,
      status: data.status,
    } as Teacher;
  }, [teacherResponse]);

  // Fetch teacher's subject-class assignments
  const { data: assignmentsResponse } = useTeacherAssignmentsQuery(teacherId, {
    enabled: !!teacherId,
  });

  // Fetch all classes to check form teacher status
  const { data: classesData } = useClassesQuery({}, { enabled: !!teacherId });

  // Get teacher's assigned subjects and classes
  const assignments = useMemo(() => {
    const data = assignmentsResponse?.data;
    if (!data || !Array.isArray(data)) return [];

    return data.map((a: any) => ({
      subject: a.subject ? {
        id: a.subject.id,
        subject_name: a.subject.subjectName || a.subject.subject_name,
      } : null,
      class: a.class ? {
        id: a.class.id,
        className: a.class.className || a.class.class_name,
        arm: a.class.arm,
        level: a.class.level,
      } : null,
    }));
  }, [assignmentsResponse]);

  // Check if teacher is a form teacher
  const formTeacherAssignment = useMemo(() => {
    if (!classesData?.data) return null;
    const classes = classesData.data.data || classesData.data;
    if (!Array.isArray(classes)) return null;

    for (const cls of classes) {
      const formTeacher = cls.form_teacher || cls.formTeacher;
      if (formTeacher && formTeacher.id === teacherId) {
        return {
          id: cls.id,
          className: cls.className || cls.class_name,
          arm: cls.arm,
          level: cls.level,
        };
      }
    }
    return null;
  }, [classesData, teacherId]);

  // Group assignments by subject
  const subjectAssignments = useMemo(() => {
    const grouped: { [key: string]: typeof assignments } = {};
    assignments.forEach((a) => {
      if (a.subject) {
        const key = a.subject.subject_name;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(a);
      }
    });
    return grouped;
  }, [assignments]);

  const handleLoginAs = (teacherData: Teacher) => {
    // Always show the role selection modal
    setShowRoleSelectionModal(true);
  };

  const performImpersonation = (role: 'Form Teacher' | 'Subject Teacher') => {
    if (!teacher) return;
    
    // Create user object for impersonation
    const impersonatedUser = {
      id: teacher.user_id || teacher.id,
      username: teacher.email.split('@')[0],
      email: teacher.email,
      role: role,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    
    // Call impersonate function from auth store
    if (impersonate) {
      impersonate(impersonatedUser);
      navigate('/dashboard');
    }
  };

  const confirmLogin = () => {
    if (pendingRole) {
      performImpersonation(pendingRole);
      setShowConfirmLoginModal(false);
      setPendingRole(null);
    }
  };

  if (teacherLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (teacherError) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Failed to load teacher details. Please try again.</Alert>
        <Button variant="outline" onClick={() => navigate('/dashboard/teachers')} className="mt-4">
          Back to Teachers
        </Button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Teacher not found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/teachers')} className="mt-4">
          Back to Teachers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/teachers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900">Teacher Profile</h1>
          <p className="text-secondary-500 mt-1">View teacher information and assignments</p>
        </div>
        {canManageTeachers && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              leftIcon={<LogIn className="h-4 w-4" />} 
              onClick={() => handleLoginAs(teacher)}
            >
              Login As
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<BookOpen className="h-4 w-4" />} 
              onClick={() => navigate(`/dashboard/teachers/${teacher.id}/assign`)}
            >
              Assign Subjects
            </Button>
            <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => setShowFormModal(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <div className="text-center">
                <Avatar
                  name={getFullName(teacher.first_name, teacher.last_name)}
                  size="xl"
                  className="mx-auto"
                />
                <h2 className="text-xl font-bold text-secondary-900 mt-4">
                  {getFullName(teacher.first_name, teacher.last_name)}
                </h2>
                <p className="text-secondary-500">{teacher.staff_id}</p>
                {formTeacherAssignment && (
                  <Badge variant="primary" className="mt-2">
                    Form Teacher - {getClassDisplayName(formTeacherAssignment)}
                  </Badge>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-secondary-600">
                  <Mail className="h-5 w-5 text-secondary-400" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600">
                  <Phone className="h-5 w-5 text-secondary-400" />
                  <span className="text-sm">{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600">
                  <MapPin className="h-5 w-5 text-secondary-400" />
                  <span className="text-sm">{teacher.address}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600">
                  <Calendar className="h-5 w-5 text-secondary-400" />
                  <span className="text-sm">Joined: {teacher.employment_date ? formatDate(teacher.employment_date) : 'N/A'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-secondary-200">
                <Badge variant={teacher.status === 'Active' ? 'success' : 'danger'}>
                  {teacher.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-primary-600">
                    {Object.keys(subjectAssignments).length}
                  </p>
                  <p className="text-xs text-secondary-500">Subjects</p>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <Users className="h-6 w-6 text-success-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-success-600">{assignments.length}</p>
                  <p className="text-xs text-secondary-500">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(subjectAssignments).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(subjectAssignments).map(([subjectName, classes]) => (
                    <div key={subjectName} className="p-4 bg-secondary-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-secondary-900">{subjectName}</h3>
                        <Badge variant="secondary" size="sm">
                          {classes.length} class{classes.length > 1 ? 'es' : ''}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {classes.map((assignment, index) =>
                          assignment.class ? (
                            <Badge key={index} variant="default" size="sm">
                              {getClassDisplayName(assignment.class)}
                            </Badge>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  No subject assignments yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Teacher Info */}
          {formTeacherAssignment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Form Teacher Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">
                        {getClassDisplayName(formTeacherAssignment)}
                      </h3>
                      <p className="text-sm text-secondary-500">
                        {formTeacherAssignment.level} Secondary School
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary-100">
                    <p className="text-sm text-secondary-600">
                      As a form teacher, you are responsible for:
                    </p>
                    <ul className="mt-2 text-sm text-secondary-500 space-y-1">
                      <li>• Daily attendance marking</li>
                      <li>• Student welfare and guidance</li>
                      <li>• Result compilation and approval</li>
                      <li>• Parent communication</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        teacher={teacher}
      />
      {/* Confirm Login Modal */}
      <Modal
        isOpen={showConfirmLoginModal}
        onClose={() => {
          setShowConfirmLoginModal(false);
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
            You are about to log in as <strong>{getFullName(teacher.first_name, teacher.last_name)}</strong> with the role of <strong>{pendingRole}</strong>.
          </Alert>
          <p className="text-sm text-gray-600">
            This will switch your account view to the teacher's perspective. You can return to your admin account at any time using the "Exit Impersonation" button.
          </p>
        </div>
      </Modal>

      {/* Role Selection Modal */}
      <Modal
        isOpen={showRoleSelectionModal}
        onClose={() => setShowRoleSelectionModal(false)}
        title="Login As Teacher"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {formTeacherAssignment ? (
              <>
                <strong>{getFullName(teacher.first_name, teacher.last_name)}</strong> is a Form Teacher for{' '}
                <strong>{formTeacherAssignment?.className} {formTeacherAssignment?.arm}</strong> and also teaches subjects.
                Please select which role you want to impersonate:
              </>
            ) : (
              <>
                You are about to login as <strong>{getFullName(teacher.first_name, teacher.last_name)}</strong> (Subject Teacher).
                This will switch your account view to the teacher's perspective.
              </>
            )}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                performImpersonation('Subject Teacher');
                setShowRoleSelectionModal(false);
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

            {formTeacherAssignment && (
              <button
                onClick={() => {
                  performImpersonation('Form Teacher');
                  setShowRoleSelectionModal(false);
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                    <School className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Form Teacher</p>
                    <p className="text-xs text-gray-500">Form class: {formTeacherAssignment?.className} {formTeacherAssignment?.arm}</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </Modal>    </div>
  );
};

export default TeacherDetail;
