import React, { useState, useMemo, useEffect } from 'react';
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
} from '../../utils/mockData';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { GRADE_CONFIG } from '../../utils/constants';
import { Download, Printer, FileText, Eye } from 'lucide-react';
import { useCurrentSession, useCurrentTerm, useSessions, useTerms } from '../../hooks/useSessionTerm';

const ResultSummary: React.FC = () => {
  // Fetch session and term data from backend
  const { data: currentSession } = useCurrentSession();
  const { data: currentTerm } = useCurrentTerm();
  const { data: sessionsResponse } = useSessions();
  const { data: termsResponse } = useTerms();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Set initial values when data loads
  useEffect(() => {
    if (currentSession && !selectedSession) {
      setSelectedSession(currentSession.id?.toString() || '');
    }
  }, [currentSession, selectedSession]);

  useEffect(() => {
    if (currentTerm && !selectedTerm) {
      setSelectedTerm(currentTerm.id?.toString() || '');
    }
  }, [currentTerm, selectedTerm]);

  // Options
  const classOptions = mockClasses.map((c) => ({ value: c.id.toString(), label: getClassDisplayName(c) }));
  const sessionOptions = useMemo(() => {
    if (!sessionsResponse?.data) return [];
    return sessionsResponse.data.map((s: any) => ({ 
      value: s.id.toString(), 
      label: s.sessionName 
    }));
  }, [sessionsResponse]);
  
  const termOptions = useMemo(() => {
    if (!termsResponse?.data) return [];
    return termsResponse.data.map((t: any) => ({ 
      value: t.id.toString(), 
      label: t.termName 
    }));
  }, [termsResponse]);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId);
  }, [selectedClass]);

  // Generate result summaries for all students
  const studentResults = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    
    return classStudents.map((student) => {
      const summary = generateStudentResultSummary(student.id, classId);
      return {
        ...student,
        ...summary,
      };
    }).sort((a, b) => (b.average || 0) - (a.average || 0)); // Sort by average descending
  }, [classStudents, selectedClass, selectedSession, selectedTerm]);

  // Add position
  const rankedResults = useMemo(() => {
    return studentResults.map((result, index) => ({
      ...result,
      position: index + 1,
    }));
  }, [studentResults]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    const averages = studentResults.map((r) => r.average || 0).filter((a) => a > 0);
    if (averages.length === 0) return { highest: 0, lowest: 0, average: 0 };
    
    return {
      highest: Math.max(...averages),
      lowest: Math.min(...averages),
      average: averages.reduce((a, b) => a + b, 0) / averages.length,
    };
  }, [studentResults]);

  const getPositionSuffix = (pos: number) => {
    if (pos === 11 || pos === 12 || pos === 13) return 'th';
    const lastDigit = pos % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
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
      label: 'Student',
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
        <Badge variant="default" size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Result Summary</h1>
          <p className="text-secondary-500 mt-1">View and export class results</p>
        </div>
        {selectedClass && (
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>
              Print All
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
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

      {/* Class Statistics */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Students</p>
              <p className="text-2xl font-bold text-secondary-900">{rankedResults.length}</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Highest Average</p>
              <p className="text-2xl font-bold text-success-600">{classStats.highest.toFixed(1)}%</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Class Average</p>
              <p className="text-2xl font-bold text-primary-600">{classStats.average.toFixed(1)}%</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Lowest Average</p>
              <p className="text-2xl font-bold text-danger-600">{classStats.lowest.toFixed(1)}%</p>
            </div>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mockClasses.find((c) => c.id === parseInt(selectedClass))
                ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                : ''}{' '}
              - {selectedTerm} Results
            </CardTitle>
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
      )}

      {/* Grade Distribution */}
      {selectedClass && rankedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {GRADE_CONFIG.map((grade) => {
                const count = rankedResults.filter(
                  (r) => calculateGrade(r.average || 0).grade === grade.grade
                ).length;
                const percentage = ((count / rankedResults.length) * 100).toFixed(1);
                
                return (
                  <div key={grade.grade} className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className={cn(
                      'text-3xl font-bold mb-1',
                      grade.grade === 'A' && 'text-success-600',
                      grade.grade === 'B' && 'text-primary-600',
                      grade.grade === 'C' && 'text-blue-600',
                      grade.grade === 'D' && 'text-warning-600',
                      grade.grade === 'F' && 'text-danger-600'
                    )}>
                      {count}
                    </div>
                    <p className="text-sm font-medium text-secondary-700">
                      Grade {grade.grade}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {percentage}%
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class to view result summary</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultSummary;
