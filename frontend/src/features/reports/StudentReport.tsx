import React, { useState, useMemo, useRef } from 'react';
import {
  Button,
  Select,
  Card,
  CardContent,
  Badge,
  Alert,
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  mockSubjects,
  generateStudentResultSummary,
  getClassDisplayName,
  mockFormTeachers,
  mockTeachers,
} from '../../utils/mockData';
import { getFullName, formatDate, calculateGrade, getGradeVariant } from '../../utils/helpers';
import { CURRENT_SESSION, CURRENT_TERM, SESSIONS, TERMS, GRADE_CONFIG, APP_CONFIG } from '../../utils/constants';
import { Download, Printer, User, BookOpen, Calendar, School, Star, CheckCircle2 } from 'lucide-react';

const StudentReport: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [selectedTerm, setSelectedTerm] = useState(CURRENT_TERM);
  const reportRef = useRef<HTMLDivElement>(null);

  // Options
  const sessionOptions = SESSIONS.map((s) => ({ value: s, label: s }));
  const termOptions = TERMS.map((t) => ({ value: t.id.toString(), label: t.name }));

  // Get student details
  const student = useMemo(() => {
    if (!selectedStudent) return null;
    return mockStudents.find((s) => s.id === parseInt(selectedStudent));
  }, [selectedStudent]);

  // Get class details
  const studentClass = useMemo(() => {
    if (!student) return null;
    return mockClasses.find((c) => c.id === student.current_class_id);
  }, [student]);

  // Get form teacher
  const formTeacher = useMemo(() => {
    if (!studentClass) return null;
    const ft = mockFormTeachers.find((f) => f.class_id === studentClass.id);
    if (!ft) return null;
    return mockTeachers.find((t) => t.id === ft.teacher_id);
  }, [studentClass]);

  // Generate result summary
  const resultSummary = useMemo(() => {
    if (!student || !studentClass) return null;
    return generateStudentResultSummary(student.id, studentClass.id);
  }, [student, studentClass]);

  // Generate detailed results
  const detailedResults = useMemo(() => {
    if (!resultSummary) return [];
    
    return resultSummary.subjects.map((subject) => ({
      subject: subject.subject_name,
      code: mockSubjects.find(s => s.id === subject.subject_id)?.subject_code || '',
      ca1: subject.test1,
      ca2: subject.test2,
      exam: subject.exam,
      total: subject.total,
      grade: subject.grade,
      remark: subject.remark,
    }));
  }, [resultSummary]);

  const studentOptions = mockStudents.map((s) => ({
    value: s.id.toString(),
    label: `${getFullName(s.first_name, s.last_name)} (${s.admission_no})`,
  }));

  const handlePrint = () => {
    window.print();
  };

  const getPositionSuffix = (pos: number) => {
    if (pos === 11 || pos === 12 || pos === 13) return 'th';
    const lastDigit = pos % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Student Report Card</h1>
          <p className="text-secondary-500 mt-1">Generate and print individual student reports</p>
        </div>
        {selectedStudent && (
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Download PDF
            </Button>
            <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
              Print
            </Button>
          </div>
        )}
      </div>

      {/* Selection */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Student"
              options={studentOptions}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder="Select student"
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

      {/* Approved Results Notice */}
      {selectedStudent && (
        <Alert variant="info">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>This report shows only approved results from the admin dashboard.</span>
          </div>
        </Alert>
      )}

      {/* Report Card */}
      {student && studentClass && resultSummary && (
        <div ref={reportRef} className="print:p-0">
          <Card className="max-w-4xl mx-auto print:shadow-none print:border-none">
            {/* School Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 print:bg-primary-600">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <School className="h-10 w-10" />
                  <h1 className="text-2xl font-bold">{APP_CONFIG.schoolName}</h1>
                </div>
                <p className="text-primary-100 text-sm">{APP_CONFIG.address}</p>
                <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full">
                  <span className="font-semibold">STUDENT REPORT CARD</span>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-500">Student Name:</span>
                    <span className="font-semibold">{getFullName(student.first_name, student.last_name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-500">Admission No:</span>
                    <span className="font-semibold">{student.admission_no}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-500">Class:</span>
                    <span className="font-semibold">{getClassDisplayName(studentClass)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">Session:</span>
                    <span className="font-semibold">{selectedSession}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">Term:</span>
                    <span className="font-semibold">{selectedTerm}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">Gender:</span>
                    <span className="font-semibold">{student.gender}</span>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary-100">
                      <th className="border border-secondary-300 px-4 py-2 text-left text-sm font-semibold">Subject</th>
                      <th className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">CA1 (20)</th>
                      <th className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">CA2 (20)</th>
                      <th className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">Exam (60)</th>
                      <th className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">Total (100)</th>
                      <th className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">Grade</th>
                      <th className="border border-secondary-300 px-4 py-2 text-left text-sm font-semibold">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                        <td className="border border-secondary-300 px-4 py-2 text-sm font-medium">{result.subject}</td>
                        <td className="border border-secondary-300 px-4 py-2 text-center text-sm">{result.ca1}</td>
                        <td className="border border-secondary-300 px-4 py-2 text-center text-sm">{result.ca2}</td>
                        <td className="border border-secondary-300 px-4 py-2 text-center text-sm">{result.exam}</td>
                        <td className="border border-secondary-300 px-4 py-2 text-center text-sm font-semibold">{result.total}</td>
                        <td className="border border-secondary-300 px-4 py-2 text-center">
                          <Badge variant={getGradeVariant(result.grade)} size="sm">
                            {result.grade}
                          </Badge>
                        </td>
                        <td className="border border-secondary-300 px-4 py-2 text-sm">{result.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-secondary-500">Total Score</p>
                  <p className="text-2xl font-bold text-primary-600">{resultSummary.total_score?.toFixed(0) || 0}</p>
                </div>
                <div className="bg-success-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-secondary-500">Average</p>
                  <p className="text-2xl font-bold text-success-600">{resultSummary.average?.toFixed(1) || 0}%</p>
                </div>
                <div className="bg-warning-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-secondary-500">Grade</p>
                  <p className="text-2xl font-bold text-warning-600">{calculateGrade(resultSummary.average || 0).grade}</p>
                </div>
                <div className="bg-info-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-secondary-500">Position</p>
                  <p className="text-2xl font-bold text-info-600">
                    {resultSummary.position || '-'}{resultSummary.position ? getPositionSuffix(resultSummary.position) : ''}
                  </p>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Grading Scale
                </h3>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {GRADE_CONFIG.map((grade) => (
                    <div key={grade.grade} className="text-center p-2 bg-white rounded">
                      <span className="font-bold">{grade.grade}</span>
                      <span className="text-secondary-500 ml-1">({grade.min_score}-{grade.max_score})</span>
                      <p className="text-secondary-400 mt-1">{grade.remark}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Class Teacher's Remark</label>
                  <div className="p-3 border border-secondary-300 rounded-lg min-h-[80px] bg-white">
                    {resultSummary.average && resultSummary.average >= 70 
                      ? "Excellent performance! Keep up the good work."
                      : resultSummary.average && resultSummary.average >= 50 
                      ? "Good effort. There is room for improvement."
                      : "Needs to put in more effort next term."}
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-secondary-300">
                    <p className="text-sm text-secondary-500">Class Teacher: {formTeacher ? getFullName(formTeacher.first_name, formTeacher.last_name) : 'N/A'}</p>
                    <p className="text-xs text-secondary-400 mt-1">Signature: _____________________</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Principal's Remark</label>
                  <div className="p-3 border border-secondary-300 rounded-lg min-h-[80px] bg-white">
                    {resultSummary.average && resultSummary.average >= 70 
                      ? "An outstanding student. Promoted to the next class."
                      : resultSummary.average && resultSummary.average >= 50 
                      ? "Shows promise. Promoted to the next class."
                      : "Needs improvement. Please see guidance counselor."}
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-secondary-300">
                    <p className="text-sm text-secondary-500">Principal</p>
                    <p className="text-xs text-secondary-400 mt-1">Signature: _____________________</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-secondary-400 pt-4 border-t border-secondary-200">
                <p>This is a computer-generated report card. Generated on {formatDate(new Date().toISOString())}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedStudent && (
        <Card>
          <div className="text-center py-12">
            <User className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a student to generate report card</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentReport;
