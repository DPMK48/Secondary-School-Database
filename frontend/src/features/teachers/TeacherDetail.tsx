import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
} from '../../components/common';
import {
  mockTeachers,
  mockTeacherSubjectAssignments,
  mockSubjects,
  mockClasses,
  mockFormTeachers,
  getClassDisplayName,
} from '../../utils/mockData';
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
} from 'lucide-react';
import TeacherForm from './TeacherForm';

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageTeachers } = useRole();
  const [showFormModal, setShowFormModal] = useState(false);

  const teacherId = parseInt(id || '0');
  const teacher = mockTeachers.find((t) => t.id === teacherId);

  // Get teacher's assigned subjects and classes
  const assignments = useMemo(() => {
    return mockTeacherSubjectAssignments
      .filter((a) => a.teacher_id === teacherId)
      .map((a) => {
        const subject = mockSubjects.find((s) => s.id === a.subject_id);
        const cls = mockClasses.find((c) => c.id === a.class_id);
        return { subject, class: cls };
      });
  }, [teacherId]);

  // Check if teacher is a form teacher
  const formTeacherAssignment = useMemo(() => {
    const ft = mockFormTeachers.find((f) => f.teacher_id === teacherId);
    if (!ft) return null;
    return mockClasses.find((c) => c.id === ft.class_id);
  }, [teacherId]);

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
          <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => setShowFormModal(true)}>
            Edit Profile
          </Button>
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

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Entered CA1 scores for JSS 1A Mathematics', time: '2 hours ago' },
                  { action: 'Marked attendance for JSS 1A', time: '1 day ago' },
                  { action: 'Submitted First Term results for approval', time: '3 days ago' },
                  { action: 'Updated student records', time: '1 week ago' },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="h-2 w-2 bg-primary-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-secondary-900">{activity.action}</p>
                      <p className="text-xs text-secondary-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        teacher={teacher}
        onSave={(data) => {
          console.log('Updating teacher:', data);
          setShowFormModal(false);
        }}
      />
    </div>
  );
};

export default TeacherDetail;
