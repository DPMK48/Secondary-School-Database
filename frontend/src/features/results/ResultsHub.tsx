import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/common';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import { Edit, CheckCircle, FileText, BookOpen, ClipboardList } from 'lucide-react';

const ResultsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEnterScores, canViewAllResults, canApproveResults } = useRole();
  const isSubjectTeacher = user?.role === 'Subject Teacher';
  const isFormTeacher = user?.role === 'Form Teacher';

  const sections = [
    {
      title: 'Subject Teacher Entry',
      description: 'Enter grades for students in your assigned subjects (all assessments)',
      icon: Edit,
      path: '/dashboard/results/subject-teacher-entry',
      color: 'bg-blue-500',
      show: canEnterScores && isSubjectTeacher,
    },
    {
      title: 'Form Teacher Compilation',
      description: 'Compile results, calculate averages, assign positions, and add remarks',
      icon: ClipboardList,
      path: '/dashboard/results/form-teacher-compilation',
      color: 'bg-indigo-500',
      show: isFormTeacher,
    },
    {
      title: 'Result Approval',
      description: 'Review compiled results, add principal remarks and signature, then approve for publication',
      icon: CheckCircle,
      path: '/dashboard/results/approval',
      color: 'bg-purple-500',
      show: canApproveResults,
    },
  ];

  const visibleSections = sections.filter(s => s.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Results Management</h1>
        <p className="text-secondary-500 mt-1">
          Manage student results, scores, and academic performance
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Quick Stats - For non-subject teachers */}
      {!isSubjectTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Scores Entered Today</p>
                  <p className="text-sm text-secondary-500">Across all subjects</p>
                </div>
                <span className="text-2xl font-bold text-primary-600">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Pending Approvals</p>
                  <p className="text-sm text-secondary-500">Classes awaiting review</p>
                </div>
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Completed Results</p>
                  <p className="text-sm text-secondary-500">Published this term</p>
                </div>
                <span className="text-2xl font-bold text-green-600">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsHub;
