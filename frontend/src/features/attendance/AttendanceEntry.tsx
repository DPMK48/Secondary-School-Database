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
  Avatar,
  Alert,
  Spinner,
} from '../../components/common';
import {
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, formatDate, cn } from '../../utils/helpers';
import { Save, Calendar, CheckCircle, XCircle, Users, Check } from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import { useClassesQuery, useClassStudentsQuery } from '../../hooks/useClasses';
import { useAttendanceByDateQuery, useBulkAttendanceMutation } from '../../hooks/useAttendance';
import { useSessionTerm } from '../../hooks/useSessionTerm';
import type { Student } from '../../types';

type AttendanceStatus = 'Present' | 'Absent';

interface AttendanceRecord {
  student_id: number;
  status: AttendanceStatus;
}

const AttendanceEntry: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const { isFormTeacher } = useRole();
  const { currentSession, currentTerm } = useSessionTerm();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<{ [studentId: number]: AttendanceRecord }>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch classes
  const { data: classesData, isLoading: isLoadingClasses } = useClassesQuery({ page: 1, perPage: 100 });
  const classes = classesData?.data || [];

  // Fetch students for selected class
  const { data: studentsData, isLoading: isLoadingStudents } = useClassStudentsQuery(
    parseInt(selectedClass) || 0,
    { enabled: !!selectedClass }
  );
  const classStudents: Student[] = studentsData?.data || [];

  // Fetch existing attendance for the selected class and date
  const { data: existingAttendance, isLoading: isLoadingAttendance } = useAttendanceByDateQuery(
    parseInt(selectedClass) || 0,
    selectedDate,
    { enabled: !!selectedClass && !!selectedDate }
  );

  // Bulk attendance mutation
  const bulkAttendanceMutation = useBulkAttendanceMutation();

  const isLoading = isLoadingClasses || isLoadingStudents || isLoadingAttendance;

  // Initialize attendance when class/date changes or existing attendance loads
  useEffect(() => {
    if (selectedClass && selectedDate && classStudents.length > 0) {
      initializeAttendance();
    }
  }, [selectedClass, selectedDate, classStudents.length, existingAttendance]);

  const initializeAttendance = () => {
    if (classStudents.length > 0) {
      const initialAttendance: { [studentId: number]: AttendanceRecord } = {};
      
      // If we have existing attendance for this date, use it
      if (existingAttendance?.data && Array.isArray(existingAttendance.data)) {
        existingAttendance.data.forEach((record: any) => {
          initialAttendance[record.studentId] = {
            student_id: record.studentId,
            status: record.status === 'Present' ? 'Present' : 'Absent',
          };
        });
        // Fill in missing students as Present
        classStudents.forEach((student) => {
          if (!initialAttendance[student.id]) {
            initialAttendance[student.id] = { student_id: student.id, status: 'Present' };
          }
        });
      } else {
        // No existing attendance, default all to Present
        classStudents.forEach((student) => {
          initialAttendance[student.id] = { student_id: student.id, status: 'Present' };
        });
      }
      
      setAttendance(initialAttendance);
      setIsSaved(false);
    }
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], student_id: studentId, status },
    });
    setIsSaved(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (!currentSession?.id || !currentTerm?.id) {
      setError('No current session or term set. Please configure them in settings.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const records = Object.values(attendance);
      const classId = parseInt(selectedClass);

      const bulkData = {
        classId: classId,
        date: selectedDate,
        sessionId: currentSession.id,
        termId: currentTerm.id,
        attendances: records.map((r) => ({
          studentId: r.student_id,
          status: r.status,
        })),
      };
      await bulkAttendanceMutation.mutateAsync(bulkData);

      setIsSaved(true);
      setSuccessMessage(`Attendance saved successfully for ${records.length} students`);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setError(err?.response?.data?.message || 'Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance: { [studentId: number]: AttendanceRecord } = {};
    classStudents.forEach((student) => {
      newAttendance[student.id] = { student_id: student.id, status: 'Present' };
    });
    setAttendance(newAttendance);
    setIsSaved(false);
    setError(null);
    setSuccessMessage(null);
  };

  const markAllAbsent = () => {
    const newAttendance: { [studentId: number]: AttendanceRecord } = {};
    classStudents.forEach((student) => {
      newAttendance[student.id] = { student_id: student.id, status: 'Absent' };
    });
    setAttendance(newAttendance);
    setIsSaved(false);
    setError(null);
    setSuccessMessage(null);
  };

  const classOptions = classes.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  // Statistics
  const stats = useMemo(() => {
    const records = Object.values(attendance);
    return {
      present: records.filter((r) => r.status === 'Present').length,
      absent: records.filter((r) => r.status === 'Absent').length,
    };
  }, [attendance]);

  // Helper function to get student name - handle both camelCase and snake_case
  const getStudentName = (student: Student) => {
    const firstName = student.firstName || student.first_name || '';
    const lastName = student.lastName || student.last_name || '';
    return getFullName(firstName, lastName);
  };

  const getStudentAdmissionNo = (student: Student) => {
    return student.admissionNo || student.admission_no || 'N/A';
  };
  const StatusButton: React.FC<{
    status: AttendanceStatus;
    currentStatus: AttendanceStatus;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ status, currentStatus, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        status === currentStatus
          ? status === 'Present'
            ? 'bg-success-100 text-success-700 ring-2 ring-success-500'
            : 'bg-danger-100 text-danger-700 ring-2 ring-danger-500'
          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
      )}
    >
      {icon}
      {label}
    </button>
  );

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
        <div className="flex items-center gap-3">
          <Avatar name={getStudentName(row)} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getStudentName(row)}
            </p>
            <p className="text-xs text-secondary-500">{getStudentAdmissionNo(row)}</p>
          </div>
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
      key: 'status',
      label: 'Attendance Status',
      render: (_value: unknown, row: Student) => {
        const record = attendance[row.id];
        const currentStatus = record?.status || 'Present';
        
        return (
          <div className="flex gap-2">
            <StatusButton
              status="Present"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'Present')}
              icon={<CheckCircle className="h-4 w-4" />}
              label="Present"
            />
            <StatusButton
              status="Absent"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'Absent')}
              icon={<XCircle className="h-4 w-4" />}
              label="Absent"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Attendance Entry</h1>
          <p className="text-secondary-500 mt-1">Mark daily attendance for students</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Info Alert for Form Teachers */}
      {isFormTeacher && (
        <Alert variant="info" title="Form Teacher Access">
          You can mark daily attendance for your assigned class. Students are automatically marked as Present by default.
        </Alert>
      )}

      {/* Selection */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={(value) => {
                setSelectedClass(value);
                setAttendance({});
                setIsSaved(false);
              }}
              placeholder="Select class"
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setIsSaved(false);
                  }}
                  max={today}
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics & Actions */}
      {selectedClass && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Present</p>
                  <p className="text-xl font-bold text-success-600">{stats.present}</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-danger-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-danger-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Absent</p>
                  <p className="text-xl font-bold text-danger-600">{stats.absent}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <>
          {isLoading ? (
            <Card>
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
                <span className="ml-3 text-secondary-600">Loading attendance data...</span>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>
                      {mockClasses.find((c) => c.id === parseInt(selectedClass))
                        ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                        : ''}{' '}
                      - {formatDate(selectedDate)}
                    </CardTitle>
                    <p className="text-sm text-secondary-500 mt-1">
                      <Users className="h-4 w-4 inline mr-1" />
                      {classStudents.length} students
                      {isSaved && (
                        <Badge variant="success" size="sm" className="ml-2">
                          <Check className="h-3 w-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllPresent} disabled={isSaving}>
                      Mark All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={markAllAbsent} disabled={isSaving}>
                      Mark All Absent
                    </Button>
                    <Button
                      leftIcon={isSaving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
                      onClick={handleSave}
                      disabled={isSaved || isSaving}
                    >
                      {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Attendance'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table
                  columns={columns}
                  data={classStudents}
                  keyExtractor={(item) => item.id.toString()}
                  emptyMessage="No students found"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class to begin attendance entry</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceEntry;
