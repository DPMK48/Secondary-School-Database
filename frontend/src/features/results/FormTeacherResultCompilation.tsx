import React, { useState, useMemo, useEffect } from 'react';
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
  Spinner,
} from '../../components/common';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { useCurrentSession, useCurrentTerm, useSessions, useTerms } from '../../hooks/useSessionTerm';
import { useClassesQuery, useClassStudentsQuery, useClassSubjectsQuery } from '../../hooks/useClasses';
import { useFormTeacherCompilationQuery } from '../../hooks/useResults';
import {
  Search,
  TrendingUp,
  Award,
  FileText,
  Download,
  Eye,
  BarChart3,
  Save,
  Edit2,
} from 'lucide-react';
import type { StudentSubjectScore } from './results.types';
import { useAuth } from '../../hooks/useAuth';
import type { Class, Subject, Student } from '../../types';

// Helper to get class display name
const getClassDisplayName = (classItem: Class | { className?: string; class_name?: string; arm?: string }) => {
  const name = classItem.className || (classItem as any).class_name || '';
  const arm = classItem.arm || '';
  return `${name} ${arm}`.trim();
};

interface StudentRemark {
  student_id: number;
  remark: string;
}

const FormTeacherResultCompilation: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSubjectScore | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [studentRemarks, setStudentRemarks] = useState<Record<number, string>>({});
  const [editingRemarkId, setEditingRemarkId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch classes from API
  const { data: classesData, isLoading: isLoadingClasses } = useClassesQuery();
  const availableClasses = useMemo(() => {
    if (!classesData) return [];
    return Array.isArray(classesData) ? classesData : classesData.data || [];
  }, [classesData]);

  // Fetch students in selected class
  const { data: studentsData, isLoading: isLoadingStudents } = useClassStudentsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );

  // Fetch subjects for selected class
  const { data: subjectsData, isLoading: isLoadingSubjects } = useClassSubjectsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );

  // Fetch compiled results from API
  const { data: compilationData, isLoading: isLoadingCompilation } = useFormTeacherCompilationQuery(
    parseInt(selectedClass) || 0,
    { 
      termId: parseInt(selectedTerm) || undefined,
      sessionId: parseInt(selectedSession) || undefined,
    },
    { enabled: !!selectedClass && !!selectedTerm && !!selectedSession }
  );

  // Get class subjects
  const classSubjects = useMemo(() => {
    if (!subjectsData) return [];
    const subjects = subjectsData.data || subjectsData || [];
    return subjects.map((cs: any) => cs.subject || cs);
  }, [subjectsData]);

  // Get students in the class
  const classStudents = useMemo(() => {
    if (!studentsData) return [];
    const students = studentsData.data || studentsData || [];
    return students
      .filter((s: Student) => s.status === 'Active')
      .sort((a: Student, b: Student) => {
        const nameA = getFullName(a.firstName || a.first_name, a.lastName || a.last_name);
        const nameB = getFullName(b.firstName || b.first_name, b.lastName || b.last_name);
        return nameA.localeCompare(nameB);
      });
  }, [studentsData]);

  // Compile results for all students - use API data when available
  const compiledResults = useMemo((): StudentSubjectScore[] => {
    if (!selectedClass) return [];
    
    // If we have API data, use it
    if (compilationData) {
      const data = compilationData.data || compilationData;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          student_id: item.student_id || item.studentId,
          student_name: item.student_name || item.studentName || 
            getFullName(item.student?.firstName || item.student?.first_name, item.student?.lastName || item.student?.last_name),
          admission_no: item.admission_no || item.admissionNo || item.student?.admissionNo || item.student?.admission_no || '',
          subject_scores: item.subject_scores || item.subjectScores || [],
          total_score: item.total_score || item.totalScore || 0,
          average_score: item.average_score || item.averageScore || 0,
          number_of_subjects: item.number_of_subjects || item.numberOfSubjects || 0,
          overall_grade: item.overall_grade || item.overallGrade || 'N/A',
        }));
      }
    }

    // Fallback: Build from students if no compiled data yet
    return classStudents.map((student: Student) => {
      const subjectScores = classSubjects.map((subject: Subject) => {
        return {
          subject_id: subject.id,
          subject_name: subject.subjectName || subject.subject_name || '',
          test1: 0,
          test2: 0,
          test3: 0,
          exam: 0,
          total: 0,
          grade: 'N/A',
          remark: 'No scores entered',
        };
      });

      return {
        student_id: student.id,
        student_name: getFullName(student.firstName || student.first_name, student.lastName || student.last_name),
        admission_no: student.admissionNo || student.admission_no || '',
        subject_scores: subjectScores,
        total_score: 0,
        average_score: 0,
        number_of_subjects: 0,
        overall_grade: 'N/A',
      };
    });
  }, [selectedClass, compilationData, classStudents, classSubjects]);

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

  const handleRemarkChange = (studentId: number, value: string) => {
    setStudentRemarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveResults = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Check if all students have remarks
      const studentsWithoutRemarks = rankedResults.filter(
        (student) => !studentRemarks[student.student_id] || studentRemarks[student.student_id].trim() === ''
      );

      if (studentsWithoutRemarks.length > 0) {
        setErrorMessage(
          `Please add remarks for all students. ${studentsWithoutRemarks.length} student(s) still need remarks.`
        );
        setIsSaving(false);
        return;
      }

      // Prepare data to send to backend
      const compiledData = rankedResults.map((student) => ({
        student_id: student.student_id,
        class_id: parseInt(selectedClass),
        session: selectedSession,
        term_id: parseInt(selectedTerm),
        total_score: student.total_score,
        average_score: student.average_score,
        position: student.position,
        overall_grade: student.overall_grade,
        form_teacher_remark: studentRemarks[student.student_id],
        number_of_subjects: student.number_of_subjects,
        subject_scores: student.subject_scores,
      }));

      // Simulate API call (replace with actual API call when backend is ready)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Uncomment when backend API is ready
      // await resultsApi.submitFormTeacherCompilation(compiledData);

      setSuccessMessage(
        `Successfully saved results for ${rankedResults.length} students. The results are now pending admin approval.`
      );
      
      // Clear remarks after successful save
      setStudentRemarks({});
    } catch (error) {
      setErrorMessage('Failed to save results. Please try again.');
      console.error('Error saving results:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if all students have remarks
  const allRemarksComplete = useMemo(() => {
    return rankedResults.every(
      (student) => studentRemarks[student.student_id] && studentRemarks[student.student_id].trim() !== ''
    );
  }, [rankedResults, studentRemarks]);

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
      key: 'remark',
      label: 'Form Teacher Remark',
      render: (_value: unknown, row: StudentSubjectScore) => {
        const isEditing = editingRemarkId === row.student_id;
        const hasRemark = studentRemarks[row.student_id]?.trim();

        return (
          <div className="min-w-[250px]">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={studentRemarks[row.student_id] || ''}
                  onChange={(e) => handleRemarkChange(row.student_id, e.target.value)}
                  placeholder="Enter remark..."
                  className="text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingRemarkId(null)}
                >
                  ✓
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm flex-1",
                  hasRemark ? "text-secondary-900" : "text-secondary-400 italic"
                )}>
                  {hasRemark || "Click to add remark"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingRemarkId(row.student_id)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
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
                  ...availableClasses.map((c: Class) => ({ value: c.id.toString(), label: getClassDisplayName(c) })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Session</label>
              <Select
                value={selectedSession}
                onChange={(value) => setSelectedSession(value)}
                options={[
                  { value: '', label: 'Select session...' },
                  ...(sessionsResponse?.data || []).map((s: any) => ({ 
                    value: s.id.toString(), 
                    label: s.sessionName 
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Term</label>
              <Select
                value={selectedTerm}
                onChange={(value) => setSelectedTerm(value)}
                options={[
                  { value: '', label: 'Select term...' },
                  ...(termsResponse?.data || []).map((t: any) => ({ 
                    value: t.id.toString(), 
                    label: t.termName 
                  }))
                ]}
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
        <>
          <Alert variant="info">
            <BarChart3 className="h-4 w-4" />
            <div>
              <p className="font-medium">Automatic Grade Compilation</p>
              <p className="text-sm mt-1">
                Average scores and positions are automatically calculated based on subject scores entered by subject
                teachers. Add remarks for each student before saving the compiled results.
              </p>
            </div>
          </Alert>

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert variant="success">
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="error">
              {errorMessage}
            </Alert>
          )}
        </>
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
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleSaveResults}
                  disabled={!allRemarksComplete || isSaving}
                  leftIcon={isSaving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
                >
                  {isSaving ? 'Saving...' : 'Save & Submit for Approval'}
                </Button>
                {isAdmin && (
                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                    Export Results
                  </Button>
                )}
              </div>
            </div>
            {!allRemarksComplete && rankedResults.length > 0 && (
              <p className="text-sm text-orange-600 mt-2">
                Please add remarks for all students before submitting
              </p>
            )}
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
