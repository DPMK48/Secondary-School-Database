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
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  mockSubjects,
  mockTeacherSubjectAssignments,
  generateMockResultsForClassSubject,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, ASSESSMENT_TYPES } from '../../utils/constants';
import { Save, Search, AlertCircle, CheckCircle } from 'lucide-react';

const ScoreEntry: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scores, setScores] = useState<{ [studentId: number]: number }>({});

  // Get available classes for the current teacher
  const availableClasses = useMemo(() => {
    // For demo, show all classes
    return mockClasses;
  }, []);

  // Get subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    const assignments = mockTeacherSubjectAssignments.filter((a) => a.class_id === classId);
    const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
    return mockSubjects.filter((s) => subjectIds.includes(s.id));
  }, [selectedClass]);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId && s.status === 'Active');
  }, [selectedClass]);

  // Filter students
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

  // Load existing scores
  useEffect(() => {
    if (selectedClass && selectedSubject && assessmentType) {
      const classId = parseInt(selectedClass);
      const subjectId = parseInt(selectedSubject);
      const existingResults = generateMockResultsForClassSubject(classId, subjectId);
      
      const newScores: { [studentId: number]: number } = {};
      existingResults.forEach((result) => {
        const assessmentId = assessmentType === 'Test 1' ? 1 : assessmentType === 'Test 2' ? 2 : assessmentType === 'Test 3' ? 3 : 4;
        if (result.assessment_id === assessmentId) {
          newScores[result.student_id] = result.score;
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScores(newScores);
    }
  }, [selectedClass, selectedSubject, assessmentType]);

  const handleScoreChange = (studentId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const maxScore = assessmentType === 'Exam' ? 60 : 20;
    setScores({
      ...scores,
      [studentId]: Math.min(Math.max(0, numValue), maxScore),
    });
  };

  const handleSave = () => {
    console.log('Saving scores:', {
      class: selectedClass,
      subject: selectedSubject,
      assessmentType,
      scores,
    });
    setShowSaveModal(false);
  };

  const classOptions = availableClasses.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  const subjectOptions = availableSubjects.map((s) => ({
    value: s.id.toString(),
    label: s.subject_name,
  }));

  const assessmentOptions = Object.values(ASSESSMENT_TYPES).map((type) => ({
    value: type.name,
    label: type.name,
  }));

  const getMaxScore = () => (assessmentType === 'Exam' ? 60 : 20);

  const columns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_value: unknown, _row: (typeof mockStudents)[0], index?: number) => (
        <span className="text-secondary-500">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
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
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'score',
      label: `Score (Max: ${getMaxScore()})`,
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
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
      render: (_value: unknown, row: (typeof mockStudents)[0]) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Score Entry</h1>
          <p className="text-secondary-500 mt-1">
            {CURRENT_SESSION} - {CURRENT_TERM}
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
                  {
                    mockClasses.find((c) => c.id === parseInt(selectedClass))
                      ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                      : ''
                  }{' '}
                  - {mockSubjects.find((s) => s.id === parseInt(selectedSubject))?.subject_name} (
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
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Confirm Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info">
            You are about to save {enteredCount} scores for {assessmentType} in{' '}
            {mockSubjects.find((s) => s.id === parseInt(selectedSubject))?.subject_name}.
          </Alert>
          <p className="text-sm text-secondary-600">
            Make sure all scores are correct before saving. You can edit scores again later if needed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ScoreEntry;
