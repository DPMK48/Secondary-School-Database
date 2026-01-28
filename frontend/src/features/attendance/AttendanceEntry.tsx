import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Avatar,
  Badge,
  Spinner,
  Alert,
  Modal,
} from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useClassStudentsQuery } from '../../hooks/useClasses';
import { attendanceApi, type AttendancePeriod } from './attendance.api';
import { getFullName, formatDate } from '../../utils/helpers';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Sun,
  Sunset,
  Save,
  Users,
  AlertTriangle,
} from 'lucide-react';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

interface StudentAttendance {
  studentId: number;
  firstName: string;
  lastName: string;
  admissionNo: string;
  gender: string;
  status: AttendanceStatus;
}

/**
 * AttendanceEntry Component
 * Allows form teachers to mark attendance for their class
 * - First attendance of the day = Morning
 * - Second attendance of the day = Afternoon
 * - Only 2 attendance records allowed per day
 */
const AttendanceEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFormTeacher } = useRole();
  
  const today = new Date().toISOString().split('T')[0];
  const classId = user?.formTeacherClassId;
  const className = user?.formTeacherClassName || 'My Class';

  // State
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceList, setAttendanceList] = useState<StudentAttendance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Attendance status for the day
  const [attendanceStatus, setAttendanceStatus] = useState<{
    hasMorning: boolean;
    hasAfternoon: boolean;
    isComplete: boolean;
    nextPeriod: AttendancePeriod | null;
  }>({
    hasMorning: false,
    hasAfternoon: false,
    isComplete: false,
    nextPeriod: 'Morning',
  });
  const [statusLoading, setStatusLoading] = useState(true);

  // Fetch students in the class
  const { data: studentsData, isLoading: studentsLoading } = useClassStudentsQuery(
    classId || 0,
    { page: 1, perPage: 100 } // Get all students
  );

  const students = studentsData?.data || [];

  // Check attendance status for the selected date
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!classId) return;
      
      setStatusLoading(true);
      setError(null);
      
      try {
        const response = await attendanceApi.getAttendanceStatus(classId, selectedDate);
        if (response.data.success) {
          setAttendanceStatus(response.data.data);
        }
      } catch (err: any) {
        // If no attendance exists, set defaults
        setAttendanceStatus({
          hasMorning: false,
          hasAfternoon: false,
          isComplete: false,
          nextPeriod: 'Morning',
        });
      } finally {
        setStatusLoading(false);
      }
    };

    checkAttendanceStatus();
  }, [classId, selectedDate]);

  // Initialize attendance list when students load
  useEffect(() => {
    if (students.length > 0) {
      const initialList = students.map((student: any) => ({
        studentId: student.id,
        firstName: student.first_name || student.firstName,
        lastName: student.last_name || student.lastName,
        admissionNo: student.admission_no || student.admissionNo,
        gender: student.gender,
        status: 'Present' as AttendanceStatus,
      }));
      setAttendanceList(initialList);
    }
  }, [students]);

  // Update student attendance status
  const updateStudentStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendanceList((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status } : student
      )
    );
  };

  // Mark all students with a specific status
  const markAllAs = (status: AttendanceStatus) => {
    setAttendanceList((prev) => prev.map((student) => ({ ...student, status })));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const present = attendanceList.filter((s) => s.status === 'Present').length;
    const absent = attendanceList.filter((s) => s.status === 'Absent').length;
    const late = attendanceList.filter((s) => s.status === 'Late').length;
    const excused = attendanceList.filter((s) => s.status === 'Excused').length;
    const total = attendanceList.length;
    return { present, absent, late, excused, total };
  }, [attendanceList]);

  // Submit attendance
  const handleSubmit = async () => {
    if (!classId || attendanceStatus.isComplete) {
      setError('Cannot submit attendance. Attendance is already complete for today.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const bulkData = {
        classId,
        date: selectedDate,
        sessionId: 1, // TODO: Get from context/settings
        termId: 1, // TODO: Get from context/settings
        period: attendanceStatus.nextPeriod || 'Morning',
        attendances: attendanceList.map((student) => ({
          studentId: student.studentId,
          status: student.status,
        })),
      };

      const response = await attendanceApi.bulkCreate(bulkData);

      if (response.data.success) {
        const period = attendanceStatus.nextPeriod;
        setSuccess(
          `${period} attendance saved successfully! ${stats.present} present, ${stats.absent} absent out of ${stats.total} students.`
        );
        
        // Update status to reflect the newly saved attendance
        if (period === 'Morning') {
          setAttendanceStatus((prev) => ({
            ...prev,
            hasMorning: true,
            nextPeriod: 'Afternoon',
          }));
        } else {
          setAttendanceStatus((prev) => ({
            ...prev,
            hasAfternoon: true,
            isComplete: true,
            nextPeriod: null,
          }));
        }
        
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      console.error('Error submitting attendance:', err);
      setError(err.response?.data?.message || 'Failed to save attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_: any, __: any, index?: number) => (
        <span className="text-secondary-500 font-medium">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_: any, row: StudentAttendance) => (
        <div className="flex items-center gap-3">
          <Avatar name={getFullName(row.firstName, row.lastName)} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(row.firstName, row.lastName)}
            </p>
            <p className="text-xs text-secondary-500">{row.admissionNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_: any, row: StudentAttendance) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: StudentAttendance) => (
        <div className="flex gap-2">
          <button
            onClick={() => updateStudentStatus(row.studentId, 'Present')}
            className={`p-2 rounded-lg transition-all ${
              row.status === 'Present'
                ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                : 'bg-secondary-100 text-secondary-500 hover:bg-green-50 hover:text-green-600'
            }`}
            title="Present"
            disabled={attendanceStatus.isComplete}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => updateStudentStatus(row.studentId, 'Absent')}
            className={`p-2 rounded-lg transition-all ${
              row.status === 'Absent'
                ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                : 'bg-secondary-100 text-secondary-500 hover:bg-red-50 hover:text-red-600'
            }`}
            title="Absent"
            disabled={attendanceStatus.isComplete}
          >
            <XCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => updateStudentStatus(row.studentId, 'Late')}
            className={`p-2 rounded-lg transition-all ${
              row.status === 'Late'
                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500'
                : 'bg-secondary-100 text-secondary-500 hover:bg-yellow-50 hover:text-yellow-600'
            }`}
            title="Late"
            disabled={attendanceStatus.isComplete}
          >
            <Clock className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  // No class assigned
  if (!classId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Mark Attendance</h1>
          <p className="text-secondary-500 mt-1">Record daily attendance for your class</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CalendarCheck className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No Class Assigned
              </h3>
              <p className="text-secondary-500">
                You have not been assigned as a form teacher to any class yet.
                Please contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Mark Attendance</h1>
          <p className="text-secondary-500 mt-1">
            {className} • {formatDate(selectedDate)}
          </p>
        </div>
        
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" title="Success">
          {success}
        </Alert>
      )}

      {/* Attendance Status Card */}
      <Card className="border-2 border-primary-100">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {/* Morning Status */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  attendanceStatus.hasMorning 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-secondary-100 text-secondary-500'
                }`}>
                  <Sun className="h-5 w-5" />
                  <span className="font-medium">Morning</span>
                  {attendanceStatus.hasMorning && <CheckCircle className="h-4 w-4" />}
                </div>
                
                {/* Afternoon Status */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  attendanceStatus.hasAfternoon 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-secondary-100 text-secondary-500'
                }`}>
                  <Sunset className="h-5 w-5" />
                  <span className="font-medium">Afternoon</span>
                  {attendanceStatus.hasAfternoon && <CheckCircle className="h-4 w-4" />}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {attendanceStatus.isComplete ? (
                <Badge variant="success" size="md">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Attendance Complete
                </Badge>
              ) : attendanceStatus.nextPeriod ? (
                <Badge variant="warning" size="md">
                  {attendanceStatus.nextPeriod === 'Morning' ? (
                    <Sun className="h-4 w-4 mr-1" />
                  ) : (
                    <Sunset className="h-4 w-4 mr-1" />
                  )}
                  Mark {attendanceStatus.nextPeriod} Attendance
                </Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Complete Warning */}
      {attendanceStatus.isComplete && (
        <Alert variant="info" title="Attendance Complete">
          Both morning and afternoon attendance have been marked for {formatDate(selectedDate)}. 
          No further attendance can be marked for this day.
        </Alert>
      )}

      {/* Statistics */}
      {!statusLoading && !attendanceStatus.isComplete && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-xs text-secondary-500">Total Students</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-secondary-500">Present</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-secondary-500">Absent</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-secondary-500">Late</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
              <p className="text-xs text-secondary-500">Excused</p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {!attendanceStatus.isComplete && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-medium text-secondary-700 self-center">
                Quick Actions:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAs('Present')}
              >
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAs('Absent')}
              >
                <XCircle className="h-4 w-4 mr-1 text-red-600" />
                Mark All Absent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({stats.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading || statusLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : attendanceList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
              <p className="text-secondary-500">No students in this class</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={attendanceList}
              keyExtractor={(item) => item.studentId.toString()}
            />
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {!attendanceStatus.isComplete && attendanceList.length > 0 && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/attendance')}>
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirmModal(true)}
            disabled={attendanceList.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save {attendanceStatus.nextPeriod} Attendance
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm ${attendanceStatus.nextPeriod} Attendance`}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirm & Save
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
            {attendanceStatus.nextPeriod === 'Morning' ? (
              <Sun className="h-8 w-8 text-primary-600" />
            ) : (
              <Sunset className="h-8 w-8 text-primary-600" />
            )}
            <div>
              <p className="font-medium text-secondary-900">
                {attendanceStatus.nextPeriod} Attendance
              </p>
              <p className="text-sm text-secondary-500">
                {className} • {formatDate(selectedDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-green-700">Present</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-red-700">Absent</p>
            </div>
          </div>

          {stats.late > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <p className="text-lg font-bold text-yellow-600">{stats.late} Late</p>
            </div>
          )}

          <Alert variant="warning" title="Important">
            <p>
              Once saved, this attendance record will be sent to the admin dashboard for review.
              {!attendanceStatus.hasMorning 
                ? ' You can mark afternoon attendance after this.'
                : ' This will complete the attendance for today.'}
            </p>
          </Alert>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceEntry;
