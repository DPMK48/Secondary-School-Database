import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Badge,
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  generateStudentResultSummary,
  getClassDisplayName,
  mockFormTeachers,
  mockTeachers,
} from '../../utils/mockData';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, SESSIONS, TERMS, GRADE_CONFIG } from '../../utils/constants';
import { Download, Printer, School, Users, TrendingUp, Award, BarChart3 } from 'lucide-react';

const ClassReport: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [selectedTerm, setSelectedTerm] = useState(CURRENT_TERM);

  // Get class details
  const currentClass = useMemo(() => {
    if (!selectedClass) return null;
    return mockClasses.find((c) => c.id === parseInt(selectedClass));
  }, [selectedClass]);

  // Get students in class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId);
  }, [selectedClass]);

  // Get form teacher
  const formTeacher = useMemo(() => {
    if (!currentClass) return null;
    const ft = mockFormTeachers.find((f) => f.class_id === currentClass.id);
    if (!ft) return null;
    return mockTeachers.find((t) => t.id === ft.teacher_id);
  }, [currentClass]);

  // Generate result summaries for all students
  const studentResults = useMemo(() => {
    if (!currentClass) return [];
    
    return classStudents.map((student) => {
      const summary = generateStudentResultSummary(student.id, currentClass.id);
      return {
        ...student,
        ...summary,
      };
    }).sort((a, b) => (b.average || 0) - (a.average || 0));
  }, [classStudents, currentClass, selectedSession, selectedTerm]);

  // Add position
  const rankedResults = useMemo(() => {
    return studentResults.map((result, index) => ({
      ...result,
      position: index + 1,
    }));
  }, [studentResults]);

  // Class statistics
  const classStats = useMemo(() => {
    const averages = studentResults.map((r) => r.average || 0).filter((a) => a > 0);
    if (averages.length === 0) return { highest: 0, lowest: 0, average: 0, passed: 0, failed: 0 };
    
    return {
      highest: Math.max(...averages),
      lowest: Math.min(...averages),
      average: averages.reduce((a, b) => a + b, 0) / averages.length,
      passed: studentResults.filter((r) => (r.average || 0) >= 40).length,
      failed: studentResults.filter((r) => (r.average || 0) < 40).length,
    };
  }, [studentResults]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    return GRADE_CONFIG.map((grade) => ({
      ...grade,
      count: studentResults.filter((r) => calculateGrade(r.average || 0).grade === grade.grade).length,
    }));
  }, [studentResults]);

  // Top 5 students
  const topStudents = useMemo(() => {
    return rankedResults.slice(0, 5);
  }, [rankedResults]);

  // Bottom 5 students
  const bottomStudents = useMemo(() => {
    return rankedResults.slice(-5).reverse();
  }, [rankedResults]);

  const classOptions = mockClasses.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  const sessionOptions = SESSIONS.map((s) => ({ value: s, label: s }));
  const termOptions = TERMS.map((t) => ({ value: t.id.toString(), label: t.name }));

  const getPositionSuffix = (pos: number) => {
    if (pos === 11 || pos === 12 || pos === 13) return 'th';
    const lastDigit = pos % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: 'position',
      label: 'Pos',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <span className={cn(
          'font-bold',
          row.position === 1 && 'text-yellow-500',
          row.position === 2 && 'text-secondary-400',
          row.position === 3 && 'text-amber-600'
        )}>
          {row.position}{getPositionSuffix(row.position)}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student Name',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <div>
          <p className="font-medium text-secondary-900">
            {getFullName(row.first_name, row.last_name)}
          </p>
          <p className="text-xs text-secondary-500">{row.admission_no}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'subjects',
      label: 'Subjects',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <span>{row.subjects.length}</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <span className="font-semibold">{row.total_score?.toFixed(0) || 0}</span>
      ),
    },
    {
      key: 'average',
      label: 'Average',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <span className="font-semibold">{row.average?.toFixed(1) || 0}%</span>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => {
        const grade = calculateGrade(row.average || 0);
        return (
          <Badge variant={getGradeVariant(grade.grade)} size="sm">
            {grade.grade}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: (typeof rankedResults)[0]) => (
        <Badge variant={(row.average || 0) >= 40 ? 'success' : 'danger'} size="sm">
          {(row.average || 0) >= 40 ? 'Passed' : 'Failed'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Class Performance Report</h1>
          <p className="text-secondary-500 mt-1">Comprehensive class analysis and rankings</p>
        </div>
        {selectedClass && (
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export Excel
            </Button>
            <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
              Print Report
            </Button>
          </div>
        )}
      </div>

      {/* Selection */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Select class"
            />
            <Select
              label="Session"
              options={sessionOptions}
              value={selectedSession}
              onChange={setSelectedSession}
            />
            <Select
              label="Term"
              options={termOptions}
              value={selectedTerm}
              onChange={setSelectedTerm}
            />
          </div>
        </CardContent>
      </Card>

      {currentClass && (
        <>
          {/* Class Info Header */}
          <Card className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <School className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{getClassDisplayName(currentClass)}</h2>
                    <p className="text-primary-100">
                      {selectedTerm} | {selectedSession}
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-sm text-primary-100">Form Teacher</p>
                  <p className="font-semibold">
                    {formTeacher ? getFullName(formTeacher.first_name, formTeacher.last_name) : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card padding="sm">
              <div className="text-center">
                <Users className="h-6 w-6 text-secondary-400 mx-auto mb-1" />
                <p className="text-xs text-secondary-500">Total Students</p>
                <p className="text-xl font-bold text-secondary-900">{rankedResults.length}</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-success-500 mx-auto mb-1" />
                <p className="text-xs text-secondary-500">Highest</p>
                <p className="text-xl font-bold text-success-600">{classStats.highest.toFixed(1)}%</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 text-primary-500 mx-auto mb-1" />
                <p className="text-xs text-secondary-500">Class Average</p>
                <p className="text-xl font-bold text-primary-600">{classStats.average.toFixed(1)}%</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-danger-500 mx-auto mb-1 rotate-180" />
                <p className="text-xs text-secondary-500">Lowest</p>
                <p className="text-xl font-bold text-danger-600">{classStats.lowest.toFixed(1)}%</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <Award className="h-6 w-6 text-success-500 mx-auto mb-1" />
                <p className="text-xs text-secondary-500">Passed</p>
                <p className="text-xl font-bold text-success-600">{classStats.passed}</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <Award className="h-6 w-6 text-danger-500 mx-auto mb-1" />
                <p className="text-xs text-secondary-500">Failed</p>
                <p className="text-xl font-bold text-danger-600">{classStats.failed}</p>
              </div>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {gradeDistribution.map((grade) => (
                  <div key={grade.grade} className="text-center">
                    <div className={cn(
                      'text-4xl font-bold mb-2',
                      grade.grade === 'A' && 'text-success-600',
                      grade.grade === 'B' && 'text-primary-600',
                      grade.grade === 'C' && 'text-blue-600',
                      grade.grade === 'D' && 'text-warning-600',
                      grade.grade === 'F' && 'text-danger-600'
                    )}>
                      {grade.count}
                    </div>
                    <Badge variant={getGradeVariant(grade.grade)} size="sm">
                      Grade {grade.grade}
                    </Badge>
                    <p className="text-xs text-secondary-500 mt-1">
                      {rankedResults.length > 0 ? ((grade.count / rankedResults.length) * 100).toFixed(0) : 0}%
                    </p>
                    {/* Visual bar */}
                    <div className="mt-2 h-24 bg-secondary-100 rounded-t-lg relative overflow-hidden">
                      <div 
                        className={cn(
                          'absolute bottom-0 left-0 right-0 rounded-t-lg transition-all',
                          grade.grade === 'A' && 'bg-success-500',
                          grade.grade === 'B' && 'bg-primary-500',
                          grade.grade === 'C' && 'bg-blue-500',
                          grade.grade === 'D' && 'bg-warning-500',
                          grade.grade === 'F' && 'bg-danger-500'
                        )}
                        style={{ 
                          height: `${rankedResults.length > 0 ? (grade.count / rankedResults.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top and Bottom Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top 5 Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center font-bold text-white',
                          index === 0 && 'bg-yellow-500',
                          index === 1 && 'bg-secondary-400',
                          index === 2 && 'bg-amber-600',
                          index > 2 && 'bg-secondary-500'
                        )}>
                          {student.position}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {getFullName(student.first_name, student.last_name)}
                          </p>
                          <p className="text-xs text-secondary-500">{student.admission_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success-600">{student.average?.toFixed(1)}%</p>
                        <Badge variant={getGradeVariant(calculateGrade(student.average || 0).grade)} size="sm">
                          {calculateGrade(student.average || 0).grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-danger-500 rotate-180" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bottomStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-secondary-400 flex items-center justify-center font-bold text-white">
                          {student.position}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {getFullName(student.first_name, student.last_name)}
                          </p>
                          <p className="text-xs text-secondary-500">{student.admission_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-danger-600">{student.average?.toFixed(1)}%</p>
                        <Badge variant={getGradeVariant(calculateGrade(student.average || 0).grade)} size="sm">
                          {calculateGrade(student.average || 0).grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Class Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table
                columns={columns}
                data={rankedResults}
                keyExtractor={(item) => item.id.toString()}
                emptyMessage="No results found"
              />
            </CardContent>
          </Card>
        </>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class to view performance report</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassReport;
