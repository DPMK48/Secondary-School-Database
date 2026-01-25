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
    </div>
  );
};

export default ReportsHub;
