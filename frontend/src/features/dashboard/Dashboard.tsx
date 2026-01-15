import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { mockDashboardStats, mockClasses, getClassDisplayName } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';
import { getRoleDisplayName } from '../../utils/permissions';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { canManageStudents, canManageTeachers, canManageClasses, canManageSubjects } = useRole();

  const stats = mockDashboardStats;

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'bg-blue-500',
      link: '/dashboard/students',
      change: '+12%',
      show: canManageStudents,
    },
    {
      title: 'Total Teachers',
      value: stats.total_teachers,
      icon: GraduationCap,
      color: 'bg-green-500',
      link: '/dashboard/teachers',
      change: '+3%',
      show: canManageTeachers,
    },
    {
      title: 'Total Classes',
      value: stats.total_classes,
      icon: School,
      color: 'bg-purple-500',
      link: '/dashboard/classes',
      change: '0%',
      show: canManageClasses,
    },
    {
      title: 'Total Subjects',
      value: stats.total_subjects,
      icon: BookOpen,
      color: 'bg-orange-500',
      link: '/dashboard/subjects',
      change: '+2%',
      show: canManageSubjects,
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
              {getRoleDisplayName(user?.role || 'subject_teacher')} Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-right">
              <p className="text-sm text-primary-200">Current Session</p>
              <p className="font-semibold">{stats.current_session.session_name}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-right">
              <p className="text-sm text-primary-200">Current Term</p>
              <p className="font-semibold">{stats.current_term.term_name}</p>
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
                  <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary-600" />
                  Recent Activities
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-secondary-900 truncate">
                          {activity.action}
                        </p>
                        <span className="text-xs text-secondary-500 whitespace-nowrap">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">{activity.description}</p>
                      <p className="text-xs text-secondary-400 mt-1">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Classes Overview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link
                  to="/dashboard/results/entry"
                  className="flex items-center justify-between p-3 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <span className="font-medium">Enter Results</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard/students"
                  className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <span className="font-medium">View Students</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard/reports"
                  className="flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <span className="font-medium">Generate Reports</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard/attendance"
                  className="flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <span className="font-medium">Record Attendance</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </CardContent>
          </Card>

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
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mockClasses.slice(0, 6).map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-secondary-900">
                        {getClassDisplayName(cls)}
                      </p>
                      <p className="text-xs text-secondary-500">{cls.level}</p>
                    </div>
                    <Badge variant={cls.level === 'Senior' ? 'primary' : 'info'}>
                      {cls.students_count} students
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
