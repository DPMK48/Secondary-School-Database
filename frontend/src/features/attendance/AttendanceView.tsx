import React, { useState, useMemo } from 'react';
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
} from '../../components/common';
import {
  mockStudents,
  mockClasses,
  generateMockAttendance,
  getClassDisplayName,
} from '../../utils/mockData';
import { getFullName, cn } from '../../utils/helpers';
import { Download, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Printer } from 'lucide-react';
import { useRole } from '../../hooks/useRole';

const AttendanceView: React.FC = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { isAdmin, canPrintAttendance } = useRole();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [viewMode, setViewMode] = useState<'summary' | 'daily'>('summary');

  const handlePrint = () => {
    window.print();
  };

  // Get students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classId = parseInt(selectedClass);
    return mockStudents.filter((s) => s.current_class_id === classId);
  }, [selectedClass]);

  // Generate attendance data for the month
  const attendanceData = useMemo(() => {
    if (!selectedClass || !selectedMonth) return [];
    
    const classId = parseInt(selectedClass);
    
    return classStudents.map((student) => {
      const records = generateMockAttendance(student.id, classId, selectedMonth);
      const summary = {
        present: records.filter((r) => r.status === 'present').length,
        absent: records.filter((r) => r.status === 'absent').length,
        late: records.filter((r) => r.status === 'late').length,
        excused: records.filter((r) => r.status === 'excused').length,
      };
      const total = summary.present + summary.absent + summary.late + summary.excused;
      const percentage = total > 0 ? ((summary.present + summary.late) / total) * 100 : 0;
      
      return {
        ...student,
        records,
        summary,
        percentage,
      };
    });
  }, [classStudents, selectedClass, selectedMonth]);

  // Class statistics
  const classStats = useMemo(() => {
    const allSummaries = attendanceData.map((d) => d.summary);
    const totalPresent = allSummaries.reduce((acc, s) => acc + s.present, 0);
    const totalAbsent = allSummaries.reduce((acc, s) => acc + s.absent, 0);
    const totalLate = allSummaries.reduce((acc, s) => acc + s.late, 0);
    const totalExcused = allSummaries.reduce((acc, s) => acc + s.excused, 0);
    const total = totalPresent + totalAbsent + totalLate + totalExcused;
    
    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      averagePercentage: total > 0 ? ((totalPresent + totalLate) / total) * 100 : 0,
    };
  }, [attendanceData]);

  const classOptions = mockClasses.map((c) => ({
    value: c.id.toString(),
    label: getClassDisplayName(c),
  }));

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-danger-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-info-500" />;
      default:
        return null;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success-600';
    if (percentage >= 75) return 'text-primary-600';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const summaryColumns = [
    {
      key: 'sn',
      label: 'S/N',
      render: (_value: unknown, _row: (typeof attendanceData)[0], index?: number) => (
        <span className="text-secondary-500">{(index || 0) + 1}</span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
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
      key: 'present',
      label: 'Present',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
        <span className="text-success-600 font-medium">{row.summary.present}</span>
      ),
    },
    {
      key: 'absent',
      label: 'Absent',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
        <span className="text-danger-600 font-medium">{row.summary.absent}</span>
      ),
    },
    {
      key: 'late',
      label: 'Late',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
        <span className="text-warning-600 font-medium">{row.summary.late}</span>
      ),
    },
    {
      key: 'excused',
      label: 'Excused',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
        <span className="text-info-600 font-medium">{row.summary.excused}</span>
      ),
    },
    {
      key: 'percentage',
      label: 'Attendance %',
      render: (_value: unknown, row: (typeof attendanceData)[0]) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-secondary-200 rounded-full overflow-hidden w-20">
            <div
              className={cn(
                'h-full rounded-full',
                row.percentage >= 90
                  ? 'bg-success-500'
                  : row.percentage >= 75
                  ? 'bg-primary-500'
                  : row.percentage >= 60
                  ? 'bg-warning-500'
                  : 'bg-danger-500'
              )}
              style={{ width: `${row.percentage}%` }}
            />
          </div>
          <span className={cn('font-semibold text-sm', getPercentageColor(row.percentage))}>
            {row.percentage.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Attendance Report</h1>
          <p className="text-secondary-500 mt-1">
            {isAdmin ? 'View and print attendance records' : 'View and analyze attendance records'}
          </p>
        </div>
        {selectedClass && (
          <div className="flex gap-2">
            {canPrintAttendance && (
              <Button 
                variant="outline" 
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
            )}
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export Report
            </Button>
          </div>
        )}
      </div>

      {/* Info Alert for Admin */}
      {isAdmin && (
        <Alert variant="info" title="Administrator View">
          You are viewing attendance in read-only mode. Only form teachers can mark attendance. Use the print and export options to generate reports.
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Class"
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Select class"
            />
            <Select
              label="Month"
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">View</label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'summary' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('summary')}
                  className="flex-1"
                >
                  Summary
                </Button>
                <Button
                  variant={viewMode === 'daily' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('daily')}
                  className="flex-1"
                >
                  Daily
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Total Present</p>
              <p className="text-2xl font-bold text-success-600">{classStats.totalPresent}</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Total Absent</p>
              <p className="text-2xl font-bold text-danger-600">{classStats.totalAbsent}</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Total Late</p>
              <p className="text-2xl font-bold text-warning-600">{classStats.totalLate}</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Total Excused</p>
              <p className="text-2xl font-bold text-info-600">{classStats.totalExcused}</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <p className="text-xs text-secondary-500">Class Average</p>
              <p className={cn('text-2xl font-bold', getPercentageColor(classStats.averagePercentage))}>
                {classStats.averagePercentage.toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && viewMode === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Monthly Summary -{' '}
              {mockClasses.find((c) => c.id === parseInt(selectedClass))
                ? getClassDisplayName(mockClasses.find((c) => c.id === parseInt(selectedClass))!)
                : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={summaryColumns}
              data={attendanceData}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No attendance records found"
            />
          </CardContent>
        </Card>
      )}

      {/* Daily View - Calendar Grid */}
      {selectedClass && viewMode === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Daily Attendance -{' '}
              {monthOptions.find((m) => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Legend */}
                <div className="flex gap-4 mb-4 pb-4 border-b border-secondary-200">
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <XCircle className="h-4 w-4 text-danger-500" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-warning-500" />
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <AlertCircle className="h-4 w-4 text-info-500" />
                    <span>Excused</span>
                  </div>
                </div>

                {/* Attendance Grid */}
                <div className="space-y-2">
                  {attendanceData.map((student, index) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <div className="w-48 flex items-center gap-2">
                        <span className="text-xs text-secondary-400 w-6">{index + 1}.</span>
                        <Avatar name={getFullName(student.first_name, student.last_name)} size="xs" />
                        <span className="text-sm font-medium truncate">
                          {getFullName(student.first_name, student.last_name)}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-1">
                        {student.records.map((record, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="h-6 w-6 flex items-center justify-center rounded"
                            title={`${record.date}: ${record.status}`}
                          >
                            {getStatusIcon(record.status)}
                          </div>
                        ))}
                      </div>
                      <div className="w-16 text-right">
                        <span className={cn('text-sm font-semibold', getPercentageColor(student.percentage))}>
                          {student.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Select a class to view attendance report</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceView;
