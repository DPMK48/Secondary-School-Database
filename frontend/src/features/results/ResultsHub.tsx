import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/common';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import { 
  Edit, 
  CheckCircle, 
  FileText, 
  ClipboardList, 
  ChevronRight,
  Calculator,
  MessageSquare,
  Users,
  TrendingUp,
} from 'lucide-react';

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

  // Quick Start actions for Subject Teachers
  const subjectTeacherQuickStarts = [
    {
      title: 'Enter CA1 Scores',
      description: 'First Continuous Assessment',
      icon: Edit,
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/dashboard/results/subject-teacher-entry'),
    },
    {
      title: 'Enter CA2 Scores',
      description: 'Second Continuous Assessment',
      icon: Edit,
      color: 'bg-green-100 text-green-600',
      action: () => navigate('/dashboard/results/subject-teacher-entry'),
    },
    {
      title: 'Enter Exam Scores',
      description: 'Final Examination',
      icon: ClipboardList,
      color: 'bg-purple-100 text-purple-600',
      action: () => navigate('/dashboard/results/subject-teacher-entry'),
    },
    {
      title: 'View My Classes',
      description: 'See assigned classes',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      action: () => navigate('/dashboard/classes'),
    },
  ];

  // Quick Start actions for Form Teachers
  const formTeacherQuickStarts = [
    {
      title: 'Compile Results',
      description: 'Calculate averages and positions',
      icon: Calculator,
      color: 'bg-indigo-100 text-indigo-600',
      action: () => navigate('/dashboard/results/form-teacher-compilation'),
    },
    {
      title: 'Add Remarks',
      description: 'Teacher & Principal comments',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
      action: () => navigate('/dashboard/results/form-teacher-compilation'),
    },
    {
      title: 'View Class Results',
      description: 'See class performance',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/dashboard/results/form-teacher-compilation'),
    },
    {
      title: 'My Class',
      description: 'View students in class',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      action: () => navigate('/dashboard/my-class'),
    },
  ];

  // Quick Start actions for Admin
  const adminQuickStarts = [
    {
      title: 'Approve Results',
      description: 'Review and publish results',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-600',
      action: () => navigate('/dashboard/results/approval'),
    },
    {
      title: 'View All Results',
      description: 'School-wide performance',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/dashboard/reports'),
    },
    {
      title: 'Generate Reports',
      description: 'Print report cards',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      action: () => navigate('/dashboard/reports'),
    },
    {
      title: 'Manage Classes',
      description: 'View all classes',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      action: () => navigate('/dashboard/classes'),
    },
  ];

  // Determine which quick starts to show
  const quickStarts = isSubjectTeacher 
    ? subjectTeacherQuickStarts 
    : isFormTeacher 
      ? formTeacherQuickStarts 
      : adminQuickStarts;

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

      {/* Quick Starts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary-500" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStarts.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={item.action}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-secondary-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 transition-colors mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
