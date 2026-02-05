import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { formatDate } from '../../utils/helpers';
import { getRoleDisplayName } from '../../utils/permissions';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Activity,
  Clock,
  UserPlus,
  FileText,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentsQuery } from '../../hooks/useStudents';
import { useTeachersQuery, useTeacherAssignmentsQuery } from '../../hooks/useTeachers';
import { useClassesQuery } from '../../hooks/useClasses';
import { useSubjectsQuery } from '../../hooks/useSubjects';
import { useCurrentSession, useCurrentTerm } from '../../hooks/useSessionTerm';
import { notificationsApi, type Activity as ActivityType, type ActivityType as ActivityTypeEnum } from '../../services/notifications.service';

// Get icon based on activity type
const getActivityIcon = (type: ActivityTypeEnum) => {
  switch (type) {
    case 'student_added':
    case 'teacher_added':
      return UserPlus;
    case 'student_updated':
    case 'teacher_updated':
    case 'result_updated':
    case 'class_updated':
    case 'subject_updated':
      return Edit;
    case 'student_deleted':
    case 'teacher_deleted':
      return Trash2;
    case 'result_entered':
    case 'result_published':
      return FileText;
    case 'attendance_marked':
      return CheckCircle;
    case 'session_created':
    case 'session_activated':
    case 'term_created':
    case 'term_activated':
      return Calendar;
    case 'class_created':
      return School;
    case 'subject_created':
      return BookOpen;
    case 'user_login':
    case 'password_changed':
      return Users;
    default:
      return Clock;
  }
};

// Get color based on activity type
const getActivityColor = (type: ActivityTypeEnum) => {
  switch (type) {
    case 'student_added':
    case 'teacher_added':
    case 'class_created':
    case 'subject_created':
    case 'session_created':
    case 'term_created':
      return 'bg-green-100 text-green-600';
    case 'student_updated':
    case 'teacher_updated':
    case 'result_updated':
    case 'class_updated':
    case 'subject_updated':
      return 'bg-blue-100 text-blue-600';
    case 'student_deleted':
    case 'teacher_deleted':
      return 'bg-red-100 text-red-600';
    case 'result_entered':
    case 'result_published':
      return 'bg-purple-100 text-purple-600';
    case 'attendance_marked':
      return 'bg-orange-100 text-orange-600';
    case 'session_activated':
    case 'term_activated':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-primary-100 text-primary-600';
  }
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, teacherId } = useAuth();
  const { canManageStudents, canManageTeachers, canManageClasses, canManageSubjects } = useRole();
  const isSubjectTeacher = user?.role === 'Subject Teacher';
  const isFormTeacher = user?.role === 'Form Teacher';
  const isTeacher = isSubjectTeacher || isFormTeacher;

  console.log('📊 [DASHBOARD] Component mounted/updated:', {
    isAuthenticated,
    user: user?.username,
    role: user?.role,
    teacherId
  });

  // Fetch data from backend - only if authenticated
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useStudentsQuery(
    { perPage: 1 },
    { enabled: isAuthenticated }
  );
  const { data: teachersData, isLoading: teachersLoading, error: teachersError } = useTeachersQuery(
    { perPage: 1 },
    { enabled: isAuthenticated }
  );
  const { data: classesData, isLoading: classesLoading, error: classesError } = useClassesQuery(
    { perPage: 1 },
    { enabled: isAuthenticated }
  );
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError } = useSubjectsQuery(
    { perPage: 1 },
    { enabled: isAuthenticated }
  );
  const { data: currentSession, isLoading: sessionLoading, isError: sessionError } = useCurrentSession();
  const { data: currentTerm, isLoading: termLoading, isError: termError } = useCurrentTerm();
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Fetch teacher's assignments if user is a teacher
  const { data: teacherAssignmentsData, isLoading: assignmentsLoading } = useTeacherAssignmentsQuery(
    teacherId || 0,
    { enabled: isAuthenticated && isTeacher && !!teacherId }
  );

  // Load recent activities
  const loadActivities = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setActivitiesLoading(true);
    try {
      const activities = await notificationsApi.getRecentActivities(10);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  console.log('📊 [DASHBOARD] Queries enabled:', isAuthenticated);
  console.log('📊 [DASHBOARD] Loading states:', {
    students: studentsLoading,
    teachers: teachersLoading,
    classes: classesLoading,
    subjects: subjectsLoading,
    session: sessionLoading,
    term: termLoading
  });
  console.log('📊 [DASHBOARD] Data received:', {
    studentsData,
    teachersData,
    classesData,
    subjectsData,
    currentSession,
    currentTerm
  });
  console.log('📊 [DASHBOARD] Errors:', {
    students: studentsError,
    teachers: teachersError,
    classes: classesError,
    subjects: subjectsError
  });

  // Calculate real stats from API data
  const stats = useMemo(() => {
    const totalStudents = studentsData?.meta?.total || 0;
    const totalTeachers = teachersData?.meta?.total || 0;
    const totalClasses = classesData?.meta?.total || 0;
    const totalSubjects = subjectsData?.meta?.total || 0;
    
    // Session and term data is already extracted by the hooks
    // Show appropriate text based on loading/error/data states
    const getSessionDisplay = () => {
      if (sessionLoading) return { sessionName: 'Loading...' };
      if (sessionError || !currentSession) return { sessionName: 'Not Set' };
      return currentSession;
    };
    
    const getTermDisplay = () => {
      if (termLoading) return { termName: 'Loading...' };
      if (termError || !currentTerm) return { termName: 'Not Set' };
      return currentTerm;
    };

    return {
      total_students: totalStudents,
      total_teachers: totalTeachers,
      total_classes: totalClasses,
      total_subjects: totalSubjects,
      current_session: getSessionDisplay(),
      current_term: getTermDisplay(),
    };
  }, [
    studentsData?.meta?.total, 
    teachersData?.meta?.total, 
    classesData?.meta?.total, 
    subjectsData?.meta?.total,
    currentSession,
    currentTerm,
    sessionLoading,
    termLoading,
    sessionError,
    termError
  ]);

  // Mock teacher ID (in real app, get from auth context)
  // const teacherId = 1; // Now using teacherId from useAuth

  // Get teacher's assigned classes and subjects from API
  const teacherAssignments = useMemo(() => {
    if (!isTeacher || !teacherAssignmentsData?.data) return [];
    return teacherAssignmentsData.data.map((a: any) => ({
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
  }, [isTeacher, teacherAssignmentsData]);

  // Get unique subjects assigned to teacher
  const teacherSubjects = useMemo(() => {
    if (!isTeacher) return [];
    const subjectMap = new Map();
    teacherAssignments.forEach((a: any) => {
      if (a.subject && !subjectMap.has(a.subject.id)) {
        subjectMap.set(a.subject.id, a.subject);
      }
    });
    return Array.from(subjectMap.values());
  }, [isTeacher, teacherAssignments]);

  // Get unique classes assigned to teacher
  const teacherClasses = useMemo(() => {
    if (!isTeacher) return [];
    const classMap = new Map();
    teacherAssignments.forEach((a: any) => {
      if (a.class && !classMap.has(a.class.id)) {
        classMap.set(a.class.id, a.class);
      }
    });
    return Array.from(classMap.values());
  }, [isTeacher, teacherAssignments]);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'bg-blue-500',
      link: '/dashboard/students',
      change: '+12%',
      show: canManageStudents,
      isLoading: studentsLoading,
    },
    {
      title: 'Total Teachers',
      value: stats.total_teachers,
      icon: GraduationCap,
      color: 'bg-green-500',
      link: '/dashboard/teachers',
      change: '+3%',
      show: canManageTeachers,
      isLoading: teachersLoading,
    },
    {
      title: 'Total Classes',
      value: stats.total_classes,
      icon: School,
      color: 'bg-purple-500',
      link: '/dashboard/classes',
      change: '0%',
      show: canManageClasses,
      isLoading: classesLoading,
    },
    {
      title: 'Total Subjects',
      value: stats.total_subjects,
      icon: BookOpen,
      color: 'bg-orange-500',
      link: '/dashboard/subjects',
      change: '+2%',
      show: canManageSubjects,
      isLoading: subjectsLoading,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-primary-100">
              {getRoleDisplayName(user?.role || 'Subject Teacher')} Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-right">
              <p className="text-sm text-primary-200">Current Session</p>
              <p className="font-semibold">
                {sessionLoading ? 'Loading...' : stats.current_session.sessionName}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-right">
              <p className="text-sm text-primary-200">Current Term</p>
              <p className="font-semibold">
                {termLoading ? 'Loading...' : stats.current_term.termName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards
          .filter((stat) => stat.show)
          .map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card hoverable className="h-full">
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-sm text-secondary-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary-900">
                    {stat.isLoading ? '...' : stat.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activities */}
        <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600" />
                    Recent Activities
                  </div>
                  <button
                    onClick={loadActivities}
                    disabled={activitiesLoading}
                    className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh activities"
                  >
                    <RefreshCw className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activitiesLoading && recentActivities.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : recentActivities.length === 0 ? (
                  <p className="text-center text-secondary-500 py-8">No recent activities</p>
                ) : (
                  recentActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);
                    
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-secondary-900 truncate">
                              {activity.title}
                            </p>
                            <span className="text-xs text-secondary-500 whitespace-nowrap">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {activity.userRole || activity.user || 'System'}
                            </Badge>
                            {activity.user && activity.userRole && (
                              <span className="text-xs text-secondary-400">
                                • {activity.user}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

        {/* Quick Actions & Classes Overview - For Admin Only */}
        {!isSubjectTeacher && !isFormTeacher && (
          <div className="space-y-6">
            {/* Classes Overview */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-primary-600" />
                    Classes Overview
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <div className="text-center py-4">Loading classes...</div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {classesData?.data?.slice(0, 6).map((cls: any) => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-secondary-900">
                              {cls.className} {cls.arm}
                            </p>
                            <p className="text-xs text-secondary-500">{cls.level}</p>
                          </div>
                          <Badge variant={cls.level === 'Senior' ? 'primary' : 'info'}>
                            {cls.students_count || 0} students
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/dashboard/classes"
                      className="block text-center text-sm text-primary-600 font-medium mt-4 hover:underline"
                    >
                      View all classes →
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Teacher's Assigned Subjects and Classes - For Teachers Only */}
        {/* Removed - now available on My Subjects page */}
      </div>
    </div>
  );
};

export default Dashboard;
