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
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, formatDate, cn } from '../../utils/helpers';
import { Save, Calendar, CheckCircle, XCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { useRole } from '../../hooks/useRole';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  student_id: number;
  status: AttendanceStatus;
  remarks?: string;
}

const AttendanceEntry: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const { isFormTeacher } = useRole();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<{ [studentId: number]: AttendanceRecord }>({});
  const [isSaved, setIsSaved] = useState(false);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId && s.status === 'Active');
  }, [selectedClass]);

  // Initialize attendance for all students as present
  useEffect(() => {
    if (classStudents.length > 0) {
      const initialAttendance: { [studentId: number]: AttendanceRecord } = {};
      classStudents.forEach((student) => {
        initialAttendance[student.id] = { student_id: student.id, status: 'present' };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendance(initialAttendance);
    }
  }, [classStudents]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], student_id: studentId, status },
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    console.log('Saving attendance:', {
      class: selectedClass,
      date: selectedDate,
      records: Object.values(attendance),
    });
    setIsSaved(true);
  };

  const markAllPresent = () => {
    const newAttendance: { [studentId: number]: AttendanceRecord } = {};
    classStudents.forEach((student) => {
      newAttendance[student.id] = { student_id: student.id, status: 'present' };
    });
    setAttendance(newAttendance);
    setIsSaved(false);
  };

  const markAllAbsent = () => {
    const newAttendance: { [studentId: number]: AttendanceRecord } = {};
    classStudents.forEach((student) => {
      newAttendance[student.id] = { student_id: student.id, status: 'absent' };
    });
    setAttendance(newAttendance);
    setIsSaved(false);
  };

  const classOptions = mockClasses.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  // Statistics
  const stats = useMemo(() => {
    const records = Object.values(attendance);
    return {
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      excused: records.filter((r) => r.status === 'excused').length,
    };
  }, [attendance]);

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
          ? status === 'present'
            ? 'bg-success-100 text-success-700 ring-1 ring-success-500'
            : status === 'absent'
            ? 'bg-danger-100 text-danger-700 ring-1 ring-danger-500'
            : status === 'late'
            ? 'bg-warning-100 text-warning-700 ring-1 ring-warning-500'
            : 'bg-info-100 text-info-700 ring-1 ring-info-500'
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
      render: (_value: unknown, _row: (typeof mockStudents)[0], index?: number) => (
        <span className="text-secondary-500">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: (typeof mockStudents)[0]) => (
        <div className="flex items-center gap-3">
          <Avatar name={getFullName(row.first_name, row.last_name)} size="sm" />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(row.first_name, row.last_name)}
            </p>
            <p className="text-xs text-secondary-500">{row.admission_no}</p>
          </div>
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
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: (typeof mockStudents)[0]) => {
        const record = attendance[row.id];
        const currentStatus = record?.status || 'present';
        
        return (
          <div className="flex gap-2">
            <StatusButton
              status="present"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'present')}
              icon={<CheckCircle className="h-4 w-4" />}
              label="Present"
            />
            <StatusButton
              status="absent"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'absent')}
              icon={<XCircle className="h-4 w-4" />}
              label="Absent"
            />
            <StatusButton
              status="late"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'late')}
              icon={<Clock className="h-4 w-4" />}
              label="Late"
            />
            <StatusButton
              status="excused"
              currentStatus={currentStatus}
              onClick={() => handleStatusChange(row.id, 'excused')}
              icon={<AlertCircle className="h-4 w-4" />}
              label="Excused"
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

      {/* Info Alert for Form Teachers */}
      {isFormTeacher && (
        <Alert variant="info" title="Form Teacher Access">
          You can mark daily attendance for your assigned class. This feature is exclusively for form teachers.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Late</p>
                  <p className="text-xl font-bold text-warning-600">{stats.late}</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-info-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Excused</p>
                  <p className="text-xl font-bold text-info-600">{stats.excused}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
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
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllPresent}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={markAllAbsent}>
                  Mark All Absent
                </Button>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  disabled={isSaved}
                >
                  {isSaved ? 'Saved' : 'Save Attendance'}
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
