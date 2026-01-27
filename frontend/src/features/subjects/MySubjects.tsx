import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTeacherAssignmentsQuery } from '../../hooks/useTeachers';
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../../components/common';
import { BookOpen, School, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper to get class display name
const getClassDisplayName = (classItem: any) => {
  const name = classItem.className || classItem.class_name || '';
  const arm = classItem.arm || '';
  return `${name} ${arm}`.trim();
};

const MySubjects: React.FC = () => {
  const { user, teacherId } = useAuth();

  // Fetch teacher's assignments from API
  const { data: assignmentsData, isLoading } = useTeacherAssignmentsQuery(
    teacherId || 0,
    { enabled: !!teacherId }
  );

  // Process assignments to get subjects with their classes
  const subjectsWithClasses = useMemo(() => {
    if (!assignmentsData) return [];
    const data = assignmentsData.data || assignmentsData || [];
    const assignments = Array.isArray(data) ? data : [];

    // Group by subject
    const subjectMap = new Map<number, { subject: any; classes: any[] }>();
    
    assignments.forEach((a: any) => {
      const subject = a.subject;
      const cls = a.class || a.classEntity;
      
      if (subject) {
        if (!subjectMap.has(subject.id)) {
          subjectMap.set(subject.id, {
            subject: {
              id: subject.id,
              subjectName: subject.subjectName || subject.subject_name,
              subjectCode: subject.subjectCode || subject.subject_code,
            },
            classes: [],
          });
        }
        if (cls) {
          subjectMap.get(subject.id)!.classes.push({
            id: cls.id,
            className: cls.className || cls.class_name,
            arm: cls.arm,
            level: cls.level,
          });
        }
      }
    });

    return Array.from(subjectMap.values());
  }, [assignmentsData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Subjects</h1>
          <p className="text-secondary-500 mt-1">
            View your assigned subjects and the classes you teach
          </p>
        </div>
        <Link to="/dashboard/results/entry">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <BookOpen className="h-4 w-4" />
            Enter Scores
          </button>
        </Link>
      </div>

      {/* No Assignments Message */}
      {subjectsWithClasses.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-secondary-600 mb-2">
                No Subjects Assigned Yet
              </p>
              <p className="text-secondary-500">
                Contact your administrator to get subjects and classes assigned to you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjectsWithClasses.map(({ subject, classes }) => (
          <Card key={subject.id} hoverable>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <BookOpen className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">
                        {subject.subjectName}
                      </h3>
                      <p className="text-sm text-secondary-500">{subject.subjectCode}</p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-secondary-700 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Classes Teaching This Subject:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classes.map((cls: any) => (
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
                      <Badge 
                        variant={cls.level === 'Senior' ? 'primary' : 'info'} 
                        size="sm"
                      >
                        {cls.level?.charAt(0) || 'J'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      {subjectsWithClasses.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  <span className="text-2xl font-bold text-secondary-900">
                    {subjectsWithClasses.length}
                  </span>
                </div>
                <p className="text-sm text-secondary-500">Total Subjects</p>
              </div>
              <div className="w-px h-12 bg-secondary-200" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <School className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-secondary-900">
                    {subjectsWithClasses.reduce((sum, s) => sum + s.classes.length, 0)}
                  </span>
                </div>
                <p className="text-sm text-secondary-500">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MySubjects;
