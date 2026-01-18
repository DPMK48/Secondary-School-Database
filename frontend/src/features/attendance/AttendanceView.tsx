import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Avatar,
  Alert,
  Badge,
  Spinner,
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, formatDate } from '../../utils/helpers';
import { Download, Calendar, CheckCircle, XCircle, Users, Eye } from 'lucide-react';
import { useRole } from '../../hooks/useRole';
// import { attendanceApi } from './attendance.api';

type ViewMode = 'class-daily' | 'student-summary';

const AttendanceView: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const { isAdmin } = useRole();

  const [viewMode, setViewMode] = useState<ViewMode>('class-daily');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);
  
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId && s.status === 'Active');
  }, [selectedClass]);

  // Load attendance data based on view mode
  useEffect(() => {
    if (viewMode === 'class-daily' && selectedClass && selectedDate) {
      loadClassDailyAttendance();
    }
  }, [viewMode, selectedClass, selectedDate, classStudents]);

  const loadClassDailyAttendance = async () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading with mock data
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use mock data - showing students without attendance marked
    const studentsWithAttendance = classStudents.map((student) => ({
      ...student,
      attendance: null, // No attendance marked yet
    }));

    setAttendanceData(studentsWithAttendance);
    setIsLoading(false);

    // TODO: Uncomment when backend API is ready
    // try {
    //   const classId = parseInt(selectedClass);
    //   const response = await attendanceApi.getClassByDate(classId, selectedDate);
    //   
    //   if (response.data.success) {
    //     const attendanceMap: { [key: number]: any } = {};
    //     response.data.data?.forEach((record: any) => {
    //       attendanceMap[record.student_id] = record;
    //     });
    //     const studentsWithAttendance = classStudents.map((student) => ({
    //       ...student,
    //       attendance: attendanceMap[student.id] || null,
    //     }));
    //     setAttendanceData(studentsWithAttendance);
    //   }
    // } catch (err: any) {
    //   console.error('Error loading attendance:', err);
    //   setError('No attendance records found for this date');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleDownload = () => {
    if (attendanceData.length === 0) {
      alert('No data to download');
      return;
    }

    let csvContent = '';
    
    if (viewMode === 'class-daily') {
      // CSV for class daily attendance
      const className = mockClasses.find((c) => c.id === parseInt(selectedClass));
      csvContent = `Class Attendance Report\\n`;
      csvContent += `Class: ${className ? getClassDisplayName(className) : ''}\\n`;
      csvContent += `Date: ${formatDate(selectedDate)}\\n\\n`;
      csvContent += `S/N,Admission No,Student Name,Gender,Status\\n`;
      
      attendanceData.forEach((student, index) => {
        const status = student.attendance?.status || 'Not Marked';
        csvContent += `${index + 1},${student.admission_no},"${getFullName(student.first_name, student.last_name)}",${student.gender},${status}\\n`;
      });
    } else {
      // CSV for student summary
      const student = mockStudents.find((s) => s.id === parseInt(selectedStudent));
      csvContent = `Student Attendance Report\\n`;
      csvContent += `Student: ${student ? getFullName(student.first_name, student.last_name) : ''}\\n`;
      csvContent += `Admission No: ${student?.admission_no || ''}\\n`;
      csvContent += `Period: ${formatDate(startDate)} to ${formatDate(endDate)}\\n\\n`;
      csvContent += `Date,Status\\n`;
      
      attendanceData.forEach((record) => {
        csvContent += `${formatDate(record.date)},${record.status}\\n`;
      });
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${viewMode}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classOptions = mockClasses.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  const studentOptions = mockStudents
    .filter((s) => s.status === 'Active')
    .map((s) => ({
      value: s.id.toString(),
      label: `${getFullName(s.first_name, s.last_name)} (${s.admission_no})`,
    }));

  // Statistics for class daily view
  const stats = useMemo(() => {
    if (viewMode !== 'class-daily' || attendanceData.length === 0) return null;
    
    const present = attendanceData.filter((s) => s.attendance?.status === 'Present').length;
    const absent = attendanceData.filter((s) => s.attendance?.status === 'Absent').length;
    const notMarked = attendanceData.filter((s) => !s.attendance).length;
    const total = attendanceData.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { present, absent, notMarked, total, percentage };
  }, [attendanceData, viewMode]);

  // Table columns for class daily view
  const classDailyColumns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_value: unknown, _row: any, index?: number) => (
        <span className="text-secondary-500">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: any) => (
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
      render: (_value: unknown, row: any) => (
        <Badge variant={row.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: any) => {
        const status = row.attendance?.status;
        if (!status) {
          return <Badge variant="warning" size="sm">Not Marked</Badge>;
        }
        return (
          <Badge
            variant={status === 'Present' ? 'success' : 'danger'}
            size="sm"
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  // Table columns for student summary view
  const studentSummaryColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (_value: unknown, row: any) => formatDate(row.date),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: any) => (
        <Badge
          variant={row.status === 'Present' ? 'success' : 'danger'}
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">View Attendance</h1>
          <p className="text-secondary-500 mt-1">View and download attendance records</p>
        </div>
      </div>

      {/* Admin Info Alert */}
      {isAdmin && (
        <Alert variant="info" title="Admin Access">
          You can view attendance records per class or individual student. Download reports in CSV format.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* View Mode Selection */}
      <Card>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={viewMode === 'class-daily' ? 'primary' : 'outline'}
              onClick={() => {
                setViewMode('class-daily');
                setAttendanceData([]);
                setError(null);
              }}
            >
              Class Daily Attendance
            </Button>
            <Button
              variant={viewMode === 'student-summary' ? 'primary' : 'outline'}
              onClick={() => {
                setViewMode('student-summary');
                setAttendanceData([]);
                setError(null);
              }}
            >
              Student Attendance Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'class-daily' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Class"
                options={classOptions}
                value={selectedClass}
                onChange={(value) => {
                  setSelectedClass(value);
                  setAttendanceData([]);
                  setError(null);
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
                      setAttendanceData([]);
                      setError(null);
                    }}
                    max={today}
                    className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Student"
                options={studentOptions}
                value={selectedStudent}
                onChange={(value) => {
                  setSelectedStudent(value);
                  setAttendanceData([]);
                  setError(null);
                }}
                placeholder="Select student"
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setAttendanceData([]);
                    setError(null);
                  }}
                  max={endDate || today}
                  className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setAttendanceData([]);
                    setError(null);
                  }}
                  min={startDate}
                  max={today}
                  className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics for Class Daily View */}
      {viewMode === 'class-daily' && stats && selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Users className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Not Marked</p>
                <p className="text-xl font-bold text-warning-600">{stats.notMarked}</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Attendance %</p>
                <p className="text-xl font-bold text-primary-600">{stats.percentage}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Data Table */}
      {(selectedClass || selectedStudent) && (
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
                      {viewMode === 'class-daily'
                        ? `${mockClasses.find((c) => c.id === parseInt(selectedClass))
                            ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                            : ''} - ${formatDate(selectedDate)}`
                        : `${mockStudents.find((s) => s.id === parseInt(selectedStudent))
                            ? getFullName(
                                mockStudents.find((s) => s.id === parseInt(selectedStudent))!.first_name,
                                mockStudents.find((s) => s.id === parseInt(selectedStudent))!.last_name
                              )
                            : ''} Attendance`}
                    </CardTitle>
                    <p className="text-sm text-secondary-500 mt-1">
                      {attendanceData.length} record{attendanceData.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={handleDownload}
                    disabled={attendanceData.length === 0}
                  >
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table
                  columns={viewMode === 'class-daily' ? classDailyColumns : studentSummaryColumns}
                  data={attendanceData}
                  keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
                  emptyMessage={error || 'No attendance records found'}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedClass && !selectedStudent && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">
              {viewMode === 'class-daily'
                ? 'Select a class and date to view attendance'
                : 'Select a student and date range to view attendance summary'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceView;
