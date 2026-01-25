import React, { useState, useMemo } from 'react';
import { useRole } from '../../hooks/useRole';
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Badge,
  Modal,
  Alert,
  Input,
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  mockSubjects,
  getClassDisplayName,
  generateMockResultsForClassSubject,
} from '../../utils/mockData';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, SESSIONS, TERMS } from '../../utils/constants';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardCheck,
  Search,
  Eye,
  MessageSquare,
} from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ResultForApproval {
  id: number;
  student_id: number;
  student_name: string;
  admission_number: string;
  subject_id: number;
  subject_name: string;
  ca1_score: number;
  ca2_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  status: ApprovalStatus;
  remarks?: string;
}

const ResultApproval: React.FC = () => {
  const { canApproveResults } = useRole();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [selectedTerm, setSelectedTerm] = useState(CURRENT_TERM);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResultForApproval | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedResults, setSelectedResults] = useState<number[]>([]);

  // Options
  const classOptions = mockClasses.map((c) => ({ value: c.id.toString(), label: getClassDisplayName(c) }));
  const subjectOptions = mockSubjects.map((s) => ({ value: s.id.toString(), label: s.subject_name }));
  const sessionOptions = SESSIONS.map((s) => ({ value: s, label: s }));
  const termOptions = TERMS.map((t) => ({ value: t.id.toString(), label: t.name }));

  // Get results for approval
  const resultsForApproval = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    
    const subjectId = parseInt(selectedSubject);
    const subject = mockSubjects.find((s) => s.id === subjectId);
    
    // Get results for this class and subject
    const results = generateMockResultsForClassSubject(parseInt(selectedClass), subjectId);
    
    // Group results by student
    const studentResults = new Map<number, { ca1: number; ca2: number; exam: number; id: number }>();
    
    results.forEach((result) => {
      if (!studentResults.has(result.student_id)) {
        studentResults.set(result.student_id, { ca1: 0, ca2: 0, exam: 0, id: result.id });
      }
      const scores = studentResults.get(result.student_id)!;
      if (result.assessment_id === 1) scores.ca1 = result.score;
      if (result.assessment_id === 2) scores.ca2 = result.score;
      if (result.assessment_id === 4) scores.exam = result.score;
    });
    
    return Array.from(studentResults.entries()).map(([studentId, scores]) => {
      const student = mockStudents.find((s) => s.id === studentId);
      const totalScore = scores.ca1 + scores.ca2 + scores.exam;
      const grade = calculateGrade(totalScore).grade;
      
      // Assign approval status for demo (deterministic based on id)
      const statuses: ApprovalStatus[] = ['pending', 'approved', 'pending', 'pending'];
      const status = statuses[scores.id % statuses.length];
      
      return {
        id: scores.id,
        student_id: studentId,
        student_name: student ? getFullName(student.first_name, student.last_name) : 'Unknown',
        admission_number: student?.admission_no || '',
        subject_id: subjectId,
        subject_name: subject?.subject_name || '',
        ca1_score: scores.ca1,
        ca2_score: scores.ca2,
        exam_score: scores.exam,
        total_score: totalScore,
        grade,
        status,
      };
    });
  }, [selectedClass, selectedSubject, selectedSession, selectedTerm]);

  // Filter results
  const filteredResults = useMemo(() => {
    return resultsForApproval.filter((result) => {
      const matchesSearch =
        !searchQuery ||
        result.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || result.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resultsForApproval, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: resultsForApproval.length,
      pending: resultsForApproval.filter((r) => r.status === 'pending').length,
      approved: resultsForApproval.filter((r) => r.status === 'approved').length,
      rejected: resultsForApproval.filter((r) => r.status === 'rejected').length,
    };
  }, [resultsForApproval]);

  const handleApprove = (result: ResultForApproval) => {
    setSelectedResult(result);
    setShowApproveModal(true);
  };

  const handleReject = (result: ResultForApproval) => {
    setSelectedResult(result);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    console.log('Approving result:', selectedResult?.id);
    setShowApproveModal(false);
    setSelectedResult(null);
  };

  const confirmReject = () => {
    console.log('Rejecting result:', selectedResult?.id, 'Reason:', rejectReason);
    setShowRejectModal(false);
    setSelectedResult(null);
    setRejectReason('');
  };

  const handleBulkApprove = () => {
    console.log('Bulk approving results:', selectedResults);
    setSelectedResults([]);
  };

  const toggleSelectResult = (id: number) => {
    if (selectedResults.includes(id)) {
      setSelectedResults(selectedResults.filter((r) => r !== id));
    } else {
      setSelectedResults([...selectedResults, id]);
    }
  };

  const toggleSelectAll = () => {
    const pendingIds = filteredResults.filter((r) => r.status === 'pending').map((r) => r.id);
    if (selectedResults.length === pendingIds.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(pendingIds);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={
            selectedResults.length > 0 &&
            selectedResults.length ===
              filteredResults.filter((r) => r.status === 'pending').length
          }
          onChange={toggleSelectAll}
          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      render: (_value: unknown, row: ResultForApproval) =>
        row.status === 'pending' ? (
          <input
            type="checkbox"
            checked={selectedResults.includes(row.id)}
            onChange={() => toggleSelectResult(row.id)}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
        ) : null,
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: ResultForApproval) => (
        <div>
          <p className="font-medium text-secondary-900">{row.student_name}</p>
          <p className="text-xs text-secondary-500">{row.admission_number}</p>
        </div>
      ),
    },
    {
      key: 'ca1',
      label: 'CA1 (20)',
      render: (_value: unknown, row: ResultForApproval) => (
        <span className={cn(row.ca1_score < 8 && 'text-danger-500')}>{row.ca1_score}</span>
      ),
    },
    {
      key: 'ca2',
      label: 'CA2 (20)',
      render: (_value: unknown, row: ResultForApproval) => (
        <span className={cn(row.ca2_score < 8 && 'text-danger-500')}>{row.ca2_score}</span>
      ),
    },
    {
      key: 'exam',
      label: 'Exam (60)',
      render: (_value: unknown, row: ResultForApproval) => (
        <span className={cn(row.exam_score < 24 && 'text-danger-500')}>{row.exam_score}</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (_value: unknown, row: ResultForApproval) => (
        <span className="font-semibold">{row.total_score}</span>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (_value: unknown, row: ResultForApproval) => (
        <Badge variant={getGradeVariant(row.grade)} size="sm">
          {row.grade}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: ResultForApproval) => (
        <Badge
          variant={
            row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'
          }
          size="sm"
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: ResultForApproval) =>
        row.status === 'pending' && canApproveResults ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(row)}
              className="text-success-600 hover:bg-success-50"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(row)}
              className="text-danger-600 hover:bg-danger-50"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Result Approval</h1>
          <p className="text-secondary-500 mt-1">Review and approve student results</p>
        </div>
        {selectedResults.length > 0 && (
          <Button leftIcon={<CheckCircle className="h-4 w-4" />} onClick={handleBulkApprove}>
            Approve Selected ({selectedResults.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Select class"
            />
            <Select
              label="Subject"
              options={subjectOptions}
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="Select subject"
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

      {/* Statistics */}
      {selectedClass && selectedSubject && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Total Results</p>
                <p className="text-xl font-bold text-secondary-900">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Pending</p>
                <p className="text-xl font-bold text-warning-600">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Approved</p>
                <p className="text-xl font-bold text-success-600">{stats.approved}</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-danger-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-danger-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Rejected</p>
                <p className="text-xl font-bold text-danger-600">{stats.rejected}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>
                {mockSubjects.find((s) => s.id === parseInt(selectedSubject))?.subject_name} Results -{' '} 
                {mockClasses.find((c) => c.id === parseInt(selectedClass))
                  ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                  : ''}
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                  className="w-48"
                />
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Status"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={columns}
              data={filteredResults}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No results found"
            />
          </CardContent>
        </Card>
      )}

      {!selectedClass || !selectedSubject ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class and subject to view results for approval</p>
          </div>
        </Card>
      ) : null}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Result"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>Approve</Button>
          </>
        }
      >
        <Alert variant="info">
          Are you sure you want to approve the result for{' '}
          <strong>{selectedResult?.student_name}</strong> in{' '}
          <strong>{selectedResult?.subject_name}</strong>?
        </Alert>
        <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-secondary-500">CA1:</span>
            <span className="font-medium">{selectedResult?.ca1_score}/20</span>
            <span className="text-secondary-500">CA2:</span>
            <span className="font-medium">{selectedResult?.ca2_score}/20</span>
            <span className="text-secondary-500">Exam:</span>
            <span className="font-medium">{selectedResult?.exam_score}/60</span>
            <span className="text-secondary-500">Total:</span>
            <span className="font-bold">{selectedResult?.total_score}/100</span>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Result"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Reject
            </Button>
          </>
        }
      >
        <Alert variant="warning" className="mb-4">
          You are about to reject the result for <strong>{selectedResult?.student_name}</strong> in{' '}
          <strong>{selectedResult?.subject_name}</strong>. Please provide a reason.
        </Alert>
        <div className="space-y-4">
          <Input
            label="Reason for Rejection"
            placeholder="Enter reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            leftIcon={<MessageSquare className="h-5 w-5" />}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ResultApproval;
