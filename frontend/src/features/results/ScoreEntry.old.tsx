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
  Modal,
  Alert,
  Spinner,
} from '../../components/common';
import { getFullName } from '../../utils/helpers';
import { ASSESSMENT_TYPES } from '../../utils/constants';
import { Save, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrentSession, useCurrentTerm } from '../../hooks/useSessionTerm';
import { useClassesQuery, useClassStudentsQuery, useClassSubjectsQuery } from '../../hooks/useClasses';
import { useBulkResultMutation, useSubjectResultsQuery } from '../../hooks/useResults';
import type { Student, Class, Subject } from '../../types';

// Helper to get class display name
const getClassDisplayName = (classItem: Class | { className?: string; class_name?: string; arm?: string }) => {
  const name = classItem.className || (classItem as any).class_name || '';
  const arm = classItem.arm || '';
  return `${name} ${arm}`.trim();
};

const ScoreEntry: React.FC = () => {
  // Fetch current session/term from backend
  const { data: currentSession } = useCurrentSession();
  const { data: currentTerm } = useCurrentTerm();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scores, setScores] = useState<{ [studentId: number]: number }>({});

  // Fetch classes from API
  const { data: classesData, isLoading: isLoadingClasses } = useClassesQuery();
  const availableClasses = useMemo(() => {
    if (!classesData) return [];
    // Handle both paginated and non-paginated responses
    return Array.isArray(classesData) ? classesData : classesData.data || [];
  }, [classesData]);

  // Fetch subjects for selected class
  const { data: subjectsData, isLoading: isLoadingSubjects } = useClassSubjectsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );
  const availableSubjects = useMemo(() => {
    if (!subjectsData) return [];
    const subjects = subjectsData.data || subjectsData || [];
    // ClassSubject has nested subject object
    return subjects.map((cs: any) => cs.subject || cs);
  }, [subjectsData]);

  // Fetch students in selected class
  const { data: studentsData, isLoading: isLoadingStudents } = useClassStudentsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );
  const classStudents = useMemo(() => {
    if (!studentsData) return [];
    const students = studentsData.data || studentsData || [];
    // Filter active students
    return students.filter((s: Student) => s.status === 'Active');
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

  // Bulk result mutation
  const bulkResultMutation = useBulkResultMutation();

  // Filter students
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

  // Load existing scores from API data
  useEffect(() => {
    if (selectedClass && selectedSubject && assessmentType && existingResultsData) {
      const results = existingResultsData.data || existingResultsData || [];
      const newScores: { [studentId: number]: number } = {};
      
      // Map assessment type to ID
      const assessmentMap: { [key: string]: number } = {
        'Test 1': 1,
        'Test 2': 2,
        'Test 3': 3,
        'Exam': 4,
      };
      const assessmentId = assessmentMap[assessmentType];
      
      results.forEach((result: any) => {
        if (result.assessment_id === assessmentId || result.assessmentId === assessmentId) {
          const studentId = result.student_id || result.studentId;
          newScores[studentId] = result.score;
        }
      });
      setScores(newScores);
    }
  }, [selectedClass, selectedSubject, assessmentType, existingResultsData]);

  const handleScoreChange = (studentId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const maxScore = assessmentType === 'Exam' ? 70 : 10;
    setScores({
      ...scores,
      [studentId]: Math.min(Math.max(0, numValue), maxScore),
    });
  };

  const handleSave = async () => {
    if (!currentSession || !currentTerm) {
      console.error('Session or term not available');
      return;
    }

    // Map assessment type to ID
    const assessmentMap: { [key: string]: number } = {
      'Test 1': 1,
      'Test 2': 2,
      'Test 3': 3,
      'Exam': 4,
    };
    const assessmentId = assessmentMap[assessmentType];

    try {
      await bulkResultMutation.mutateAsync({
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject),
        teacher_id: 1, // TODO: Get from auth context
        session_id: currentSession.id,
        term_id: currentTerm.id,
        assessment_id: assessmentId,
        scores: Object.entries(scores).map(([studentId, score]) => ({
          student_id: parseInt(studentId),
          score,
        })),
      });
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving scores:', error);
    }
  };

  const classOptions = availableClasses.map((c: Class) => ({
    value: (c.id || (c as any).id).toString(),
    label: getClassDisplayName(c),
  }));

  const subjectOptions = availableSubjects.map((s: Subject) => ({
    value: (s.id || (s as any).id).toString(),
    label: s.subjectName || s.subject_name || '',
  }));

  const assessmentOptions = Object.values(ASSESSMENT_TYPES).map((type) => ({
    value: type.name,
    label: type.name,
  }));

  const getMaxScore = () => (assessmentType === 'Exam' ? 70 : 10);

  const isLoading = isLoadingClasses || isLoadingSubjects || isLoadingStudents;

  const columns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_value: unknown, _row: Student, index?: number) => (
        <span className="text-secondary-500">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: Student) => (
        <div>
          <p className="font-medium text-secondary-900">
            {getFullName(row.firstName || row.first_name, row.lastName || row.last_name)}
          </p>
          <p className="text-xs text-secondary-500">{row.admissionNo || row.admission_no}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_value: unknown, row: Student) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'score',
      label: `Score (Max: ${getMaxScore()})`,
      render: (_value: unknown, row: Student) => (
        <Input
          type="number"
          min={0}
          max={getMaxScore()}
          value={scores[row.id]?.toString() || ''}
          onChange={(e) => handleScoreChange(row.id, e.target.value)}
          className="w-24"
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: Student) => {
        const score = scores[row.id];
        if (score === undefined || score === null) {
          return (
            <Badge variant="warning" size="sm">
              Pending
            </Badge>
          );
        }
        return (
          <Badge variant="success" size="sm">
            Entered
          </Badge>
        );
      },
    },
  ];

  const enteredCount = Object.keys(scores).length;
  const pendingCount = filteredStudents.length - enteredCount;

  // Get selected class and subject names for display
  const selectedClassObj = availableClasses.find((c: Class) => c.id === parseInt(selectedClass));
  const selectedSubjectObj = availableSubjects.find((s: Subject) => s.id === parseInt(selectedSubject));

  if (isLoading && !classesData) {
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
          <h1 className="text-2xl font-bold text-secondary-900">Score Entry</h1>
          <p className="text-secondary-500 mt-1">
            {currentSession?.sessionName || 'Loading...'} - {currentTerm?.termName || 'Loading...'}
          </p>
        </div>
      </div>

      {/* Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={(value) => {
                setSelectedClass(value);
                setSelectedSubject('');
                setScores({});
              }}
              placeholder="Select class"
            />
            <Select
              label="Subject"
              options={subjectOptions}
              value={selectedSubject}
              onChange={(value) => {
                setSelectedSubject(value);
                setScores({});
              }}
              placeholder="Select subject"
              disabled={!selectedClass}
            />
            <Select
              label="Assessment Type"
              options={assessmentOptions}
              value={assessmentType}
              onChange={(value) => {
                setAssessmentType(value);
                setScores({});
              }}
              placeholder="Select type"
              disabled={!selectedSubject}
            />
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Table */}
      {selectedClass && selectedSubject && assessmentType && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {selectedClassObj ? getClassDisplayName(selectedClassObj) : ''}{' '}
                  - {selectedSubjectObj?.subjectName || selectedSubjectObj?.subject_name || ''} (
                  {assessmentType})
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-secondary-500">
                    <CheckCircle className="h-4 w-4 inline mr-1 text-success-500" />
                    {enteredCount} Entered
                  </span>
                  <span className="text-sm text-secondary-500">
                    <AlertCircle className="h-4 w-4 inline mr-1 text-warning-500" />
                    {pendingCount} Pending
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                  className="w-64"
                />
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={() => setShowSaveModal(true)}
                  disabled={enteredCount === 0}
                >
                  Save Scores
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No students found"
            />
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class, subject, and assessment type to begin score entry</p>
          </div>
        </Card>
      )}

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Scores"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSaveModal(false)} disabled={bulkResultMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={bulkResultMutation.isPending}>
              {bulkResultMutation.isPending ? 'Saving...' : 'Confirm Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info">
            You are about to save {enteredCount} scores for {assessmentType} in{' '}
            {selectedSubjectObj?.subjectName || selectedSubjectObj?.subject_name || ''}.
          </Alert>
          <p className="text-sm text-secondary-600">
            Make sure all scores are correct before saving. You can edit scores again later if needed.
          </p>
          {bulkResultMutation.isPending && (
            <div className="flex justify-center">
              <Spinner size="md" />
            </div>
          )}
          {bulkResultMutation.isError && (
            <Alert variant="error">
              Failed to save scores. Please try again.
            </Alert>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ScoreEntry;
