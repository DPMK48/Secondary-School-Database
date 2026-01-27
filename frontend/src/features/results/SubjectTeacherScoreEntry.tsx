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
import { getFullName, calculateGrade } from '../../utils/helpers';
import { ASSESSMENT_TYPES } from '../../utils/constants';
import { Save, AlertCircle, CheckCircle, Search, Edit } from 'lucide-react';
import type { SubjectScoreEntry } from './results.types';
import { useCurrentSession, useCurrentTerm } from '../../hooks/useSessionTerm';
import { useTeacherAssignmentsQuery } from '../../hooks/useTeachers';
import { useClassStudentsQuery } from '../../hooks/useClasses';
import { useBulkSubjectScoresMutation, useSubjectResultsQuery } from '../../hooks/useResults';
import { useAuth } from '../../hooks/useAuth';
import type { Student, Class, Subject } from '../../types';

// Helper to get class display name
const getClassDisplayName = (classItem: Class | { className?: string; class_name?: string; arm?: string }) => {
  const name = classItem.className || (classItem as any).class_name || '';
  const arm = classItem.arm || '';
  return `${name} ${arm}`.trim();
};

const SubjectTeacherScoreEntry: React.FC = () => {
  // Fetch current session/term from backend
  const { data: currentSession } = useCurrentSession();
  const { data: currentTerm } = useCurrentTerm();
  const { user } = useAuth();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scores, setScores] = useState<{ [key: string]: { [assessment: string]: number } }>({});
  const [savedScores, setSavedScores] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Get teacher ID from user context
  const teacherId = user?.teacherId || 1;

  // Fetch teacher's assignments from API
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useTeacherAssignmentsQuery(
    teacherId,
    { enabled: !!teacherId }
  );

  // Process assignments to get available classes and subjects
  const availableAssignments = useMemo(() => {
    if (!assignmentsData) return [];
    const data = assignmentsData.data || assignmentsData || [];
    return Array.isArray(data) ? data : [];
  }, [assignmentsData]);

  const availableClasses = useMemo(() => {
    const classMap = new Map();
    availableAssignments.forEach((a: any) => {
      const cls = a.class || a.classEntity;
      if (cls && !classMap.has(cls.id)) {
        classMap.set(cls.id, cls);
      }
    });
    return Array.from(classMap.values());
  }, [availableAssignments]);

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    const subjectMap = new Map();
    availableAssignments
      .filter((a: any) => {
        const cls = a.class || a.classEntity;
        return cls && cls.id === classId;
      })
      .forEach((a: any) => {
        const subj = a.subject;
        if (subj && !subjectMap.has(subj.id)) {
          subjectMap.set(subj.id, subj);
        }
      });
    return Array.from(subjectMap.values());
  }, [selectedClass, availableAssignments]);

  // Fetch students in selected class
  const { data: studentsData, isLoading: isLoadingStudents } = useClassStudentsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );

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

  // Fetch existing results for selected class/subject
  const { data: existingResultsData } = useSubjectResultsQuery(
    {
      classId: parseInt(selectedClass) || 0,
      subjectId: parseInt(selectedSubject) || 0,
      termId: currentTerm?.id,
      sessionId: currentSession?.id,
    },
    { enabled: !!selectedClass && !!selectedSubject && !!currentTerm && !!currentSession }
  );

  // Bulk save mutation
  const bulkSaveMutation = useBulkSubjectScoresMutation();

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student: Student) => {
      const fullName = getFullName(student.firstName || student.first_name, student.lastName || student.last_name);
      const admissionNo = student.admissionNo || student.admission_no || '';
      return (
        !searchQuery ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [classStudents, searchQuery]);

  // Load existing scores when class and subject change
  useEffect(() => {
    if (selectedClass && selectedSubject && existingResultsData) {
      const results = existingResultsData.data || existingResultsData || [];
      const newScores: { [key: string]: { [assessment: string]: number } } = {};
      const saved = new Set<string>();

      classStudents.forEach((student: Student) => {
        const studentKey = `student_${student.id}`;
        newScores[studentKey] = {};

        const studentResults = results.filter((r: any) => 
          (r.student_id || r.studentId) === student.id
        );
        
        studentResults.forEach((result: any) => {
          const assessmentId = result.assessment_id || result.assessmentId;
          // 1st Test=1, 2nd Test=2, 3rd Test=3, Exam=4
          const assessmentName =
            assessmentId === 1 ? 'test1' :
            assessmentId === 2 ? 'test2' :
            assessmentId === 3 ? 'test3' : 'exam';
          newScores[studentKey][assessmentName] = result.score;
          saved.add(`${studentKey}_${assessmentName}`);
        });
      });

      setScores(newScores);
      setSavedScores(saved);
    }
  }, [selectedClass, selectedSubject, existingResultsData, classStudents]);

  const handleScoreChange = (studentId: number, assessment: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const maxScore =
      assessment === 'exam'
        ? ASSESSMENT_TYPES.EXAM.max_score
        : ASSESSMENT_TYPES.TEST1.max_score;

    const studentKey = `student_${studentId}`;
    setScores({
      ...scores,
      [studentKey]: {
        ...scores[studentKey],
        [assessment]: Math.min(Math.max(0, numValue), maxScore),
      },
    });

    // Remove from saved set since it's been modified
    const scoreKey = `${studentKey}_${assessment}`;
    setSavedScores((prev) => {
      const newSet = new Set(prev);
      newSet.delete(scoreKey);
      return newSet;
    });
  };

  const calculateTotal = (studentId: number): number => {
    const studentKey = `student_${studentId}`;
    const studentScores = scores[studentKey] || {};
    return (
      (studentScores.test1 || 0) +
      (studentScores.test2 || 0) +
      (studentScores.test3 || 0) +
      (studentScores.exam || 0)
    );
  };

  const handleSaveAll = async () => {
    if (!selectedClass || !selectedSubject || !currentSession || !currentTerm) return;

    setSaveError('');
    setSaveSuccess(false);

    try {
      // Build scores array for API
      const scoresArray = Object.entries(scores).map(([studentKey, studentScores]) => {
        const studentId = parseInt(studentKey.replace('student_', ''));
        return {
          student_id: studentId,
          test1: studentScores.test1,
          test2: studentScores.test2,
          test3: studentScores.test3,
          exam: studentScores.exam,
        };
      }).filter(s => s.test1 !== undefined || s.test2 !== undefined || s.test3 !== undefined || s.exam !== undefined);

      await bulkSaveMutation.mutateAsync({
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject),
        teacher_id: teacherId,
        session_id: currentSession.id,
        term_id: currentTerm.id,
        scores: scoresArray,
      });

      // Mark all scores as saved
      const allScoreKeys = new Set<string>();
      Object.keys(scores).forEach((studentKey) => {
        Object.keys(scores[studentKey]).forEach((assessment) => {
          allScoreKeys.add(`${studentKey}_${assessment}`);
        });
      });
      setSavedScores(allScoreKeys);
      setSaveSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError('Failed to save scores. Please try again.');
    }
  };

  const getUnsavedCount = (): number => {
    let count = 0;
    Object.keys(scores).forEach((studentKey) => {
      Object.keys(scores[studentKey]).forEach((assessment) => {
        if (!savedScores.has(`${studentKey}_${assessment}`)) {
          count++;
        }
      });
    });
    return count;
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <div>
          <div className="font-medium text-secondary-900">{row.student_name}</div>
          <div className="text-sm text-secondary-500">{row.admission_no}</div>
        </div>
      ),
    },
    {
      key: 'test1',
      label: `1st Test (/${ASSESSMENT_TYPES.TEST1.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST1.max_score}
          value={scores[`student_${row.student_id}`]?.test1 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test1', e.target.value)}
          className="w-16"
          placeholder="0"
        />
      ),
    },
    {
      key: 'test2',
      label: `2nd Test (/${ASSESSMENT_TYPES.TEST2.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST2.max_score}
          value={scores[`student_${row.student_id}`]?.test2 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test2', e.target.value)}
          className="w-16"
          placeholder="0"
        />
      ),
    },
    {
      key: 'test3',
      label: `3rd Test (/${ASSESSMENT_TYPES.TEST3.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST3.max_score}
          value={scores[`student_${row.student_id}`]?.test3 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test3', e.target.value)}
          className="w-16"
          placeholder="0"
        />
      ),
    },
    {
      key: 'exam',
      label: `Exam (/${ASSESSMENT_TYPES.EXAM.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.EXAM.max_score}
          value={scores[`student_${row.student_id}`]?.exam || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'exam', e.target.value)}
          className="w-16"
          placeholder="0"
        />
      ),
    },
    {
      key: 'total',
      label: 'Total (100)',
      render: (_value: unknown, row: SubjectScoreEntry) => {
        const total = calculateTotal(row.student_id);
        const grade = calculateGrade(total);
        return (
          <div className="text-center">
            <div className="font-bold text-lg text-secondary-900">{total}</div>
            <Badge variant={grade.variant as any}>{grade.grade}</Badge>
          </div>
        );
      },
    },
  ];

  const tableData: SubjectScoreEntry[] = filteredStudents.map((student: Student) => ({
    student_id: student.id,
    student_name: getFullName(student.firstName || student.first_name, student.lastName || student.last_name),
    admission_no: student.admissionNo || student.admission_no || '',
    saved: false,
  }));

  const unsavedCount = getUnsavedCount();
  const isSaving = bulkSaveMutation.isPending;
  const isLoading = isLoadingAssignments || isLoadingStudents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Subject Teacher Score Entry</h1>
          <p className="text-secondary-500 mt-1">Enter grades for students in your assigned subjects</p>
        </div>
        <div className="flex items-center gap-4 bg-primary-50 rounded-lg px-4 py-3">
          <div className="text-sm">
            <p className="text-secondary-600">Session</p>
            <p className="font-semibold text-secondary-900">
              {currentSession?.sessionName || 'Loading...'}
            </p>
          </div>
          <div className="w-px h-8 bg-secondary-300" />
          <div className="text-sm">
            <p className="text-secondary-600">Term</p>
            <p className="font-semibold text-secondary-900">
              {currentTerm?.termName || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Select Class</label>
              <Select
                value={selectedClass}
                onChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSubject('');
                }}
                options={[
                  { value: '', label: 'Choose a class...' },
                  ...availableClasses.map((c: Class) => ({ 
                    value: c.id.toString(), 
                    label: getClassDisplayName(c) 
                  })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Select Subject</label>
              <Select
                value={selectedSubject}
                onChange={(value) => setSelectedSubject(value)}
                options={[
                  { value: '', label: 'Choose a subject...' },
                  ...availableSubjects.map((s: Subject) => ({ 
                    value: s.id.toString(), 
                    label: s.subjectName || s.subject_name || '' 
                  })),
                ]}
                disabled={!selectedClass}
              />
            </div>
          </div>

          {selectedClass && selectedSubject && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary">
                  {currentSession?.sessionName || 'Loading...'} - {currentTerm?.termName || 'Loading...'}
                </Badge>
                <Badge variant="secondary">{classStudents.length} Students</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <span>All scores saved successfully!</span>
        </Alert>
      )}

      {saveError && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <span>{saveError}</span>
        </Alert>
      )}

      {/* Scores Entry Table */}
      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Enter Scores
              </CardTitle>
              <div className="flex items-center gap-3">
                {unsavedCount > 0 && (
                  <Badge variant="warning">
                    {unsavedCount} unsaved {unsavedCount === 1 ? 'change' : 'changes'}
                  </Badge>
                )}
                <Button onClick={handleSaveAll} disabled={isSaving || unsavedCount === 0}>
                  {isSaving ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All Scores
                    </>
                  )}
                </Button>
              </div>
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

            {/* Instructions */}
            <Alert variant="info" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Score Entry Guidelines:</p>
                <ul className="mt-1 text-sm space-y-1">
                  <li>• Each test is out of {ASSESSMENT_TYPES.TEST1.max_score} marks</li>
                  <li>• Exam is out of {ASSESSMENT_TYPES.EXAM.max_score} marks</li>
                  <li>• Total score is automatically calculated out of 100</li>
                  <li>• Scores entered here will reflect on the form teacher's dashboard</li>
                </ul>
              </div>
            </Alert>

            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={tableData}
                keyExtractor={(item) => item.student_id}
              />
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-secondary-500">No students found in this class.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Selection State */}
      {(!selectedClass || !selectedSubject) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Edit className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Select Class and Subject</h3>
            <p className="text-secondary-500">Choose a class and subject to start entering scores</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectTeacherScoreEntry;
