import React, { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Badge,
  Alert,
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  mockSubjects,
  generateMockResultsForClassSubject,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, SESSIONS, TERMS } from '../../utils/constants';
import {
  Search,
  TrendingUp,
  Award,
  FileText,
  Download,
  Eye,
  BarChart3,
} from 'lucide-react';
import type { StudentSubjectScore } from './results.types';

const FormTeacherResultCompilation: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [selectedTerm, setSelectedTerm] = useState(CURRENT_TERM.toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSubjectScore | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  // Get form teacher's assigned class (mock - get from auth context in real app)
  const formTeacherClass = mockClasses[0]; // Mock: first class

  // Get all subjects taught in the class
  const classSubjects = useMemo(() => {
    return mockSubjects.filter((s) => s.level === formTeacherClass?.level);
  }, [formTeacherClass]);

  // Get students in the form teacher's class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents
      .filter((s) => s.current_class_id === classId && s.status === 'Active')
      .sort((a, b) => getFullName(a.first_name, a.last_name).localeCompare(getFullName(b.first_name, b.last_name)));
  }, [selectedClass]);

  // Compile results for all students with automatic average calculation
  const compiledResults = useMemo((): StudentSubjectScore[] => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);

    return classStudents.map((student) => {
      const subjectScores = classSubjects.map((subject) => {
        const results = generateMockResultsForClassSubject(classId, subject.id).filter(
          (r) => r.student_id === student.id
        );

        const test1 = results.find((r) => r.assessment_id === 1)?.score || 0;
        const test2 = results.find((r) => r.assessment_id === 2)?.score || 0;
        const test3 = results.find((r) => r.assessment_id === 3)?.score || 0;
        const exam = results.find((r) => r.assessment_id === 4)?.score || 0;

        const total = test1 + test2 + test3 + exam;
        const gradeInfo = calculateGrade(total);

        return {
          subject_id: subject.id,
          subject_name: subject.subject_name,
          test1,
          test2,
          test3,
          exam,
          total,
          grade: gradeInfo.grade,
          remark: gradeInfo.remark,
        };
      });

      // Filter subjects that have at least one score entered
      const enteredSubjects = subjectScores.filter(
        (s) => s.test1 > 0 || s.test2 > 0 || s.test3 > 0 || s.exam > 0
      );

      const totalScore = enteredSubjects.reduce((sum, s) => sum + s.total, 0);
      const numberOfSubjects = enteredSubjects.length;
      const averageScore = numberOfSubjects > 0 ? totalScore / numberOfSubjects : 0;
      const overallGrade = calculateGrade(averageScore);

      return {
        student_id: student.id,
        student_name: getFullName(student.first_name, student.last_name),
        admission_no: student.admission_no,
        subject_scores: subjectScores,
        total_score: totalScore,
        average_score: averageScore,
        number_of_subjects: numberOfSubjects,
        overall_grade: overallGrade.grade,
      };
    });
  }, [selectedClass, classStudents, classSubjects]);

  // Rank students by average score
  const rankedResults = useMemo(() => {
    return [...compiledResults]
      .sort((a, b) => b.average_score - a.average_score)
      .map((result, index) => ({
        ...result,
        position: index + 1,
      }));
  }, [compiledResults]);

  // Filter results by search
  const filteredResults = useMemo(() => {
    return rankedResults.filter((result) => {
      return (
        !searchQuery ||
        result.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [rankedResults, searchQuery]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    const averages = rankedResults.map((r) => r.average_score).filter((a) => a > 0);
    if (averages.length === 0)
      return {
        highest: 0,
        lowest: 0,
        average: 0,
        totalStudents: rankedResults.length,
        studentsWithResults: 0,
      };

    return {
      highest: Math.max(...averages),
      lowest: Math.min(...averages),
      average: averages.reduce((a, b) => a + b, 0) / averages.length,
      totalStudents: rankedResults.length,
      studentsWithResults: averages.length,
    };
  }, [rankedResults]);

  const getPositionSuffix = (pos: number) => {
    if (pos === 11 || pos === 12 || pos === 13) return 'th';
    const lastDigit = pos % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  const handleViewStudentDetail = (student: StudentSubjectScore) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  };

  const columns = [
    {
      key: 'position',
      label: 'Pos',
      render: (_value: unknown, row: StudentSubjectScore & { position?: number }) => (
        <span
          className={cn(
            'font-bold text-lg',
            row.position === 1 && 'text-yellow-500',
            row.position === 2 && 'text-gray-400',
            row.position === 3 && 'text-amber-600'
          )}
        >
          {row.position}
          {getPositionSuffix(row.position!)}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: StudentSubjectScore) => (
        <div>
          <div className="font-medium text-secondary-900">{row.student_name}</div>
          <div className="text-sm text-secondary-500">{row.admission_no}</div>
        </div>
      ),
    },
    {
      key: 'subjects_entered',
      label: 'Subjects',
      render: (_value: unknown, row: StudentSubjectScore) => (
        <div className="text-center">
          <Badge variant={row.number_of_subjects > 0 ? 'success' : 'secondary'}>
            {row.number_of_subjects} / {classSubjects.length}
          </Badge>
        </div>
      ),
    },
    {
      key: 'total_score',
      label: 'Total Score',
      render: (_value: unknown, row: StudentSubjectScore) => (
        <div className="text-center font-semibold text-secondary-900">{row.total_score.toFixed(1)}</div>
      ),
    },
    {
      key: 'average',
      label: 'Average',
      render: (_value: unknown, row: StudentSubjectScore) => (
        <div className="text-center">
          <div className="font-bold text-lg text-primary-600">{row.average_score.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (_value: unknown, row: StudentSubjectScore) => {
        return (
          <div className="text-center">
            <Badge variant={getGradeVariant(row.overall_grade)} className="text-lg px-3 py-1">
              {row.overall_grade}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: StudentSubjectScore) => (
        <Button variant="outline" size="sm" onClick={() => handleViewStudentDetail(row)}>
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Form Teacher Result Compilation</h1>
        <p className="text-secondary-500 mt-1">
          View and compile results from all subject teachers for your class
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Select Class</label>
              <Select
                value={selectedClass}
                onChange={(value) => setSelectedClass(value)}
                options={[
                  { value: '', label: 'Choose a class...' },
                  ...mockClasses.map((c) => ({ value: c.id.toString(), label: getClassDisplayName(c) })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Session</label>
              <Select
                value={selectedSession}
                onChange={(value) => setSelectedSession(value)}
                options={SESSIONS.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Term</label>
              <Select
                value={selectedTerm}
                onChange={(value) => setSelectedTerm(value)}
                options={TERMS.map((t) => ({ value: t.id.toString(), label: t.name }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      {selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Total Students</p>
                  <p className="text-2xl font-bold text-secondary-900">{classStats.totalStudents}</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Highest Average</p>
                  <p className="text-2xl font-bold text-green-600">{classStats.highest.toFixed(2)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Class Average</p>
                  <p className="text-2xl font-bold text-primary-600">{classStats.average.toFixed(2)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">With Results</p>
                  <p className="text-2xl font-bold text-purple-600">{classStats.studentsWithResults}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Information Alert */}
      {selectedClass && (
        <Alert variant="info">
          <BarChart3 className="h-4 w-4" />
          <div>
            <p className="font-medium">Automatic Grade Compilation</p>
            <p className="text-sm mt-1">
              Average scores are automatically calculated based on the number of subjects entered by subject
              teachers. The position is determined by the overall average score.
            </p>
          </div>
        </Alert>
      )}

      {/* Results Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Student Results Summary
              </CardTitle>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table columns={columns} data={filteredResults} keyExtractor={(item) => item.student_id.toString()} />
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-8 text-secondary-500">No students found.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Selection State */}
      {!selectedClass && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Select Class</h3>
            <p className="text-secondary-500">Choose a class to view compiled results</p>
          </CardContent>
        </Card>
      )}

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedStudent.student_name} - Subject Breakdown
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowStudentDetail(false)}>
                  ✕
                </Button>
              </div>
              <p className="text-sm text-secondary-500">{selectedStudent.admission_no}</p>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <p className="text-sm text-primary-700 font-medium">Total Score</p>
                  <p className="text-2xl font-bold text-primary-900">{selectedStudent.total_score.toFixed(1)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Average Score</p>
                  <p className="text-2xl font-bold text-green-900">{selectedStudent.average_score.toFixed(2)}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">Overall Grade</p>
                  <p className="text-2xl font-bold text-purple-900">{selectedStudent.overall_grade}</p>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-secondary-900">Subject Scores</h4>
                {selectedStudent.subject_scores.map((subject) => (
                  <div key={subject.subject_id} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-secondary-900">{subject.subject_name}</h5>
                      <Badge variant={getGradeVariant(subject.grade)}>{subject.grade}</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-sm">
                      <div>
                        <p className="text-secondary-500">Test 1</p>
                        <p className="font-medium">{subject.test1}/10</p>
                      </div>
                      <div>
                        <p className="text-secondary-500">Test 2</p>
                        <p className="font-medium">{subject.test2}/10</p>
                      </div>
                      <div>
                        <p className="text-secondary-500">Test 3</p>
                        <p className="font-medium">{subject.test3}/10</p>
                      </div>
                      <div>
                        <p className="text-secondary-500">Exam</p>
                        <p className="font-medium">{subject.exam}/70</p>
                      </div>
                      <div>
                        <p className="text-secondary-500">Total</p>
                        <p className="font-bold text-primary-600">{subject.total}/100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedStudent.number_of_subjects === 0 && (
                <div className="text-center py-8 text-secondary-500">
                  No scores have been entered for this student yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FormTeacherResultCompilation;
