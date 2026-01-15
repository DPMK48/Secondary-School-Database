import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/common';
import { useRole } from '../../hooks/useRole';
import { User, Users, FileText, Download, Printer } from 'lucide-react';

const ReportsHub: React.FC = () => {
  const navigate = useNavigate();
  const { canViewAllResults } = useRole();

  const sections = [
    {
      title: 'Student Report',
      description: 'Generate individual student report cards',
      icon: User,
      path: '/dashboard/reports/student',
      color: 'bg-blue-500',
      show: true,
    },
    {
      title: 'Class Report',
      description: 'View class performance and analytics',
      icon: Users,
      path: '/dashboard/reports/class',
      color: 'bg-green-500',
      show: canViewAllResults,
    },
  ];

  const visibleSections = sections.filter(s => s.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Reports & Analytics</h1>
        <p className="text-secondary-500 mt-1">
          Generate and export academic reports and performance analytics
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Print Report Cards</p>
                <p className="text-sm text-secondary-500">Bulk print for entire class</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Export to Excel</p>
                <p className="text-sm text-secondary-500">Download class results</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Generate Analytics</p>
                <p className="text-sm text-secondary-500">Performance trends</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Class Comparison</p>
                <p className="text-sm text-secondary-500">Compare classes</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500">Reports Generated</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">156</p>
            <p className="text-xs text-green-600 mt-1">This term</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500">Students Evaluated</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">450</p>
            <p className="text-xs text-blue-600 mt-1">All classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500">Average Score</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">67.5%</p>
            <p className="text-xs text-purple-600 mt-1">School wide</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500">Subjects Assessed</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">12</p>
            <p className="text-xs text-orange-600 mt-1">This term</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsHub;
