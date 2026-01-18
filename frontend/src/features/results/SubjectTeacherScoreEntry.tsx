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
import {
  mockStudents,
  mockClasses,
  mockSubjects,
  mockTeacherSubjectAssignments,
  generateMockResultsForClassSubject,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, calculateGrade } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, ASSESSMENT_TYPES } from '../../utils/constants';
import { Save, AlertCircle, CheckCircle, Search, Edit } from 'lucide-react';
import type { SubjectScoreEntry } from './results.types';

const SubjectTeacherScoreEntry: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scores, setScores] = useState<{ [key: string]: { [assessment: string]: number } }>({});
  const [savedScores, setSavedScores] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Get available classes for the current teacher (mock - get from auth context in real app)
  const teacherId = 1; // Mock teacher ID
  const availableAssignments = useMemo(() => {
    return mockTeacherSubjectAssignments.filter((a) => a.teacher_id === teacherId);
  }, [teacherId]);

  const availableClasses = useMemo(() => {
    const classIds = [...new Set(availableAssignments.map((a) => a.class_id))];
    return mockClasses.filter((c) => classIds.includes(c.id));
  }, [availableAssignments]);

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    const assignments = availableAssignments.filter((a) => a.class_id === classId);
    const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
    return mockSubjects.filter((s) => subjectIds.includes(s.id));
  }, [selectedClass, availableAssignments]);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents
      .filter((s) => s.current_class_id === classId && s.status === 'Active')
      .sort((a, b) => getFullName(a.first_name, a.last_name).localeCompare(getFullName(b.first_name, b.last_name)));
  }, [selectedClass]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const fullName = getFullName(student.first_name, student.last_name);
      return (
        !searchQuery ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [classStudents, searchQuery]);

  // Load existing scores when class and subject change
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      const classId = parseInt(selectedClass);
      const subjectId = parseInt(selectedSubject);
      const existingResults = generateMockResultsForClassSubject(classId, subjectId);

      const newScores: { [key: string]: { [assessment: string]: number } } = {};
      const saved = new Set<string>();

      classStudents.forEach((student) => {
        const studentKey = `student_${student.id}`;
        newScores[studentKey] = {};

        const studentResults = existingResults.filter((r) => r.student_id === student.id);
        studentResults.forEach((result) => {
          const assessmentName =
            result.assessment_id === 1
              ? 'test1'
              : result.assessment_id === 2
              ? 'test2'
              : result.assessment_id === 3
              ? 'test3'
              : 'exam';
          newScores[studentKey][assessmentName] = result.score;
          saved.add(`${studentKey}_${assessmentName}`);
        });
      });

      setScores(newScores);
      setSavedScores(saved);
    }
  }, [selectedClass, selectedSubject, classStudents]);

  const handleScoreChange = (studentId: number, assessment: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const maxScore =
      assessment === 'test1' || assessment === 'test2' || assessment === 'test3'
        ? ASSESSMENT_TYPES.TEST1.max_score
        : ASSESSMENT_TYPES.EXAM.max_score;

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
    if (!selectedClass || !selectedSubject) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
    } finally {
      setIsSaving(false);
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
      label: `Test 1 (/${ASSESSMENT_TYPES.TEST1.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST1.max_score}
          value={scores[`student_${row.student_id}`]?.test1 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test1', e.target.value)}
          className="w-20"
          placeholder="0"
        />
      ),
    },
    {
      key: 'test2',
      label: `Test 2 (/${ASSESSMENT_TYPES.TEST2.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST2.max_score}
          value={scores[`student_${row.student_id}`]?.test2 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test2', e.target.value)}
          className="w-20"
          placeholder="0"
        />
      ),
    },
    {
      key: 'test3',
      label: `Test 3 (/${ASSESSMENT_TYPES.TEST3.max_score})`,
      render: (_value: unknown, row: SubjectScoreEntry) => (
        <Input
          type="number"
          min="0"
          max={ASSESSMENT_TYPES.TEST3.max_score}
          value={scores[`student_${row.student_id}`]?.test3 || ''}
          onChange={(e) => handleScoreChange(row.student_id, 'test3', e.target.value)}
          className="w-20"
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
          className="w-20"
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

  const tableData: SubjectScoreEntry[] = filteredStudents.map((student) => ({
    student_id: student.id,
    student_name: getFullName(student.first_name, student.last_name),
    admission_no: student.admission_no,
    saved: false,
  }));

  const unsavedCount = getUnsavedCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Subject Teacher Score Entry</h1>
        <p className="text-secondary-500 mt-1">Enter grades for students in your assigned subjects</p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Select Class</label>
              <Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject('');
                }}
                options={[
                  { value: '', label: 'Choose a class...' },
                  ...availableClasses.map((c) => ({ value: c.id.toString(), label: getClassDisplayName(c) })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Select Subject</label>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[
                  { value: '', label: 'Choose a subject...' },
                  ...availableSubjects.map((s) => ({ value: s.id.toString(), label: s.subject_name })),
                ]}
                disabled={!selectedClass}
              />
            </div>
          </div>

          {selectedClass && selectedSubject && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary">
                  {CURRENT_SESSION} - Term {CURRENT_TERM}
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
        <Alert variant="danger">
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

            {/* Table */}
            <div className="overflow-x-auto">
              <Table columns={columns} data={tableData} />
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
