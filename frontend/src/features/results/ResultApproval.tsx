import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Badge,
  Alert,
  Input,
  Spinner,
} from '../../components/common';
import { getFullName, calculateGrade, getGradeVariant, cn } from '../../utils/helpers';
import { useCurrentSession, useCurrentTerm, useSessions, useTerms } from '../../hooks/useSessionTerm';
import { useClassesQuery } from '../../hooks/useClasses';
import { resultsApi } from './results.api';
import {
  CheckCircle,
  Search,
  Eye,
  Edit2,
  FileSignature,
  Save,
  Send,
} from 'lucide-react';

interface CompiledStudentResult {
  student_id: number;
  student_name: string;
  admission_no: string;
  class_id: number;
  class_name: string;
  average_score: number;
  position: number;
  overall_grade: string;
  form_teacher_remark: string;
  total_score: number;
  number_of_subjects: number;
  status: 'pending' | 'approved';
}

// Helper function to get class display name
const getClassDisplayName = (cls: any): string => {
  if (!cls) return '';
  const name = cls.className || cls.class_name || '';
  const arm = cls.arm || '';
  return `${name}${arm ? ` ${arm}` : ''}`.trim();
};

const ResultApproval: React.FC = () => {
  // Fetch session and term data from backend
  const { data: currentSession } = useCurrentSession();
  const { data: currentTerm } = useCurrentTerm();
  const { data: sessions } = useSessions();
  const { data: terms } = useTerms();
  
  // Fetch classes from backend
  const { data: classesData, isLoading: classesLoading } = useClassesQuery();
  const classes = classesData?.data || [];
  
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
  
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [principalRemarks, setPrincipalRemarks] = useState<Record<number, string>>({});
  const [signature, setSignature] = useState('');
  const [editingRemarkId, setEditingRemarkId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch compiled results from form teacher when class, term, session are selected
  const { 
    data: compilationData, 
    isLoading: compilationLoading,
    refetch: refetchCompilation,
  } = useQuery({
    queryKey: ['form-teacher-compilation', selectedClass, selectedTerm, selectedSession],
    queryFn: () => resultsApi.getFormTeacherCompilation(parseInt(selectedClass), {
      term_id: parseInt(selectedTerm),
      session_id: parseInt(selectedSession),
    }),
    enabled: !!selectedClass && !!selectedTerm && !!selectedSession,
  });

  // Transform API data to the format expected by the component
  const compiledResults = useMemo((): CompiledStudentResult[] => {
    const data = compilationData?.data?.data || compilationData?.data || [];
    
    if (!Array.isArray(data) || data.length === 0) return [];
    
    const selectedClassObj = classes.find((c: any) => c.id === parseInt(selectedClass));
    
    return data.map((item: any, index: number) => {
      const student = item.student || {};
      const firstName = student.firstName || student.first_name || '';
      const lastName = student.lastName || student.last_name || '';
      const admissionNo = student.admissionNo || student.admission_no || '';
      
      // Calculate number of subjects from subjects array
      const subjects = item.subjects || [];
      const numberOfSubjects = subjects.length;
      
      // Average score from backend
      const averageScore = item.averageScore || item.average_score || 0;
      const totalScore = item.totalScore || item.total_score || 0;
      
      // Get grade from average
      const gradeInfo = calculateGrade(averageScore);
      
      return {
        student_id: student.id || item.studentId,
        student_name: getFullName(firstName, lastName),
        admission_no: admissionNo,
        class_id: parseInt(selectedClass),
        class_name: getClassDisplayName(selectedClassObj),
        average_score: averageScore,
        position: item.position || index + 1,
        overall_grade: gradeInfo.grade,
        form_teacher_remark: item.formTeacherRemark || item.form_teacher_remark || '',
        total_score: totalScore,
        number_of_subjects: numberOfSubjects,
        status: item.isApproved ? 'approved' : 'pending',
      };
    }).sort((a: CompiledStudentResult, b: CompiledStudentResult) => b.average_score - a.average_score)
      .map((result: CompiledStudentResult, index: number) => ({ ...result, position: index + 1 }));
  }, [compilationData, selectedClass, classes]);

  // Filter results
  const filteredResults = useMemo(() => {
    return compiledResults.filter((result) => 
      !searchQuery ||
      result.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [compiledResults, searchQuery]);

  const handlePrincipalRemarkChange = (studentId: number, value: string) => {
    setPrincipalRemarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleApproveAndPublish = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      // Check if all students have principal remarks
      const studentsWithoutRemarks = filteredResults.filter(
        (student) => student.status === 'pending' && (!principalRemarks[student.student_id] || principalRemarks[student.student_id].trim() === '')
      );

      if (studentsWithoutRemarks.length > 0) {
        alert(`Please add principal remarks for all pending students. ${studentsWithoutRemarks.length} student(s) still need remarks.`);
        setIsSaving(false);
        return;
      }

      if (!signature.trim()) {
        alert('Please add principal signature before approving.');
        setIsSaving(false);
        return;
      }

      // Call the approve API
      await resultsApi.approveResults({
        class_id: parseInt(selectedClass),
        term_id: parseInt(selectedTerm),
        session_id: parseInt(selectedSession),
        approved_by: 1, // TODO: Get from current user context
      });

      const approvedCount = filteredResults.filter(r => r.status === 'pending').length;

      setSuccessMessage(
        `Successfully approved and published results for ${approvedCount} students. Results are now available in the Reports section.`
      );

      // Clear form and refetch
      setPrincipalRemarks({});
      setSignature('');
      refetchCompilation();
    } catch (error) {
      alert('Failed to approve results. Please try again.');
      console.error('Error approving results:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const allRemarksComplete = useMemo(() => {
    const pendingStudents = filteredResults.filter(r => r.status === 'pending');
    return pendingStudents.every(
      (student) => principalRemarks[student.student_id] && principalRemarks[student.student_id].trim() !== ''
    ) && signature.trim() !== '';
  }, [filteredResults, principalRemarks, signature]);

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
      label: 'Position',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <span className={cn(
          'font-bold text-lg',
          row.position === 1 && 'text-yellow-500',
          row.position === 2 && 'text-gray-400',
          row.position === 3 && 'text-amber-600'
        )}>
          {row.position}{getPositionSuffix(row.position)}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <div>
          <div className="font-medium text-secondary-900">{row.student_name}</div>
          <div className="text-sm text-secondary-500">{row.admission_no}</div>
        </div>
      ),
    },
    {
      key: 'average',
      label: 'Average',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <div className="text-center font-bold text-lg text-primary-600">
          {row.average_score.toFixed(2)}%
        </div>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <Badge variant={getGradeVariant(row.overall_grade)} className="text-lg px-3 py-1">
          {row.overall_grade}
        </Badge>
      ),
    },
    {
      key: 'form_teacher_remark',
      label: 'Form Teacher Remark',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <div className="text-sm text-secondary-700 max-w-xs">{row.form_teacher_remark}</div>
      ),
    },
    {
      key: 'principal_remark',
      label: 'Principal Remark',
      render: (_value: unknown, row: CompiledStudentResult) => {
        const isEditing = editingRemarkId === row.student_id;
        const hasRemark = principalRemarks[row.student_id]?.trim();

        if (row.status === 'approved') {
          return <span className="text-sm text-secondary-700">{principalRemarks[row.student_id] || 'Approved'}</span>;
        }

        return (
          <div className="min-w-[250px]">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={principalRemarks[row.student_id] || ''}
                  onChange={(e) => handlePrincipalRemarkChange(row.student_id, e.target.value)}
                  placeholder="Enter principal remark..."
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
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: CompiledStudentResult) => (
        <Badge variant={row.status === 'approved' ? 'success' : 'warning'}>
          {row.status === 'approved' ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Result Approval</h1>
        <p className="text-secondary-500 mt-1">
          Review compiled results from form teachers, add principal remarks and signature, then approve for publication
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Session"
              options={[
                { value: '', label: 'Select session...' },
                ...(Array.isArray(sessions) ? sessions : []).map((s: any) => ({ 
                  value: s.id.toString(), 
                  label: s.sessionName 
                }))
              ]}
              value={selectedSession}
              onChange={setSelectedSession}
            />
            <Select
              label="Term"
              options={[
                { value: '', label: 'Select term...' },
                ...(Array.isArray(terms) ? terms : []).map((t: any) => ({ 
                  value: t.id.toString(), 
                  label: t.termName 
                }))
              ]}
              value={selectedTerm}
              onChange={setSelectedTerm}
            />
            <Select
              label="Class"
              options={[
                { value: '', label: 'Select class...' },
                ...classes.map((c: any) => ({ 
                  value: c.id.toString(), 
                  label: getClassDisplayName(c) 
                })),
              ]}
              value={selectedClass}
              onChange={setSelectedClass}
            />
          </div>
        </CardContent>
      </Card>

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      {/* Results Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Compiled Results - {classes.find((c: any) => c.id === parseInt(selectedClass))
                  ? getClassDisplayName(classes.find((c: any) => c.id === parseInt(selectedClass))!)
                  : ''}
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {compilationLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">No results found for this class. Results will appear here once form teachers submit them.</p>
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={filteredResults}
                  keyExtractor={(item) => item.student_id.toString()}
                />

                {/* Principal Signature */}
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileSignature className="h-5 w-5 text-secondary-600" />
                    <h3 className="font-semibold text-secondary-900">Principal Signature</h3>
                  </div>
                  <Input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter principal name/signature..."
                    className="max-w-md"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    onClick={handleApproveAndPublish}
                    disabled={!allRemarksComplete || isSaving}
                    leftIcon={isSaving ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
                  >
                    {isSaving ? 'Approving...' : 'Approve & Publish to Reports'}
                  </Button>
                </div>
                
                {!allRemarksComplete && filteredResults.some(r => r.status === 'pending') && (
                  <p className="text-sm text-orange-600 mt-2 text-right">
                    Please add principal remarks for all pending students and signature before approving
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class to view compiled results for approval</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultApproval;
