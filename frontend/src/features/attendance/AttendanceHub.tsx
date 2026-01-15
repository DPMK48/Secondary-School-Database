import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/common';
import { useRole } from '../../hooks/useRole';
import { CalendarCheck, Eye, Users, TrendingUp } from 'lucide-react';

const AttendanceHub: React.FC = () => {
  const navigate = useNavigate();
  const { canManageAttendance, isAdmin, isFormTeacher } = useRole();

  const sections = [
    {
      title: 'Mark Attendance',
      description: 'Record daily attendance for your class',
      icon: CalendarCheck,
      path: '/dashboard/attendance/entry',
      color: 'bg-green-500',
      show: canManageAttendance && isFormTeacher, // Only form teachers can mark attendance
    },
    {
      title: 'View Attendance',
      description: isAdmin 
        ? 'View attendance records and print reports' 
        : 'View attendance history and generate reports',
      icon: Eye,
      path: '/dashboard/attendance/view',
      color: 'bg-blue-500',
      show: true, // Both admin and form teacher can view
    },
  ];

  const visibleSections = sections.filter(s => s.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Attendance Management</h1>
        <p className="text-secondary-500 mt-1">
          Track and manage student attendance records
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.path} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(section.path)}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${section.color} p-4 rounded-xl`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-secondary-500 mt-2">
                      {section.description}
                    </p>
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate(section.path)}>
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Today's Attendance</p>
                <p className="text-2xl font-bold text-secondary-900">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">This Week</p>
                <p className="text-2xl font-bold text-secondary-900">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">This Month</p>
                <p className="text-2xl font-bold text-secondary-900">91%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">SS2 A - Today</p>
                <p className="text-sm text-secondary-500">Marked at 08:30 AM</p>
              </div>
              <span className="text-sm font-medium text-green-600">35/38 Present</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">SS2 A - Yesterday</p>
                <p className="text-sm text-secondary-500">Marked at 08:25 AM</p>
              </div>
              <span className="text-sm font-medium text-green-600">37/38 Present</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">SS2 A - 2 days ago</p>
                <p className="text-sm text-secondary-500">Marked at 08:35 AM</p>
              </div>
              <span className="text-sm font-medium text-green-600">36/38 Present</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHub;
