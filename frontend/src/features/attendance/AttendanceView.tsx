import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Modal,
} from '../../components/common';
import { useClassesQuery } from '../../hooks/useClasses';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { attendanceApi, type AttendancePeriod, type AttendanceStatusResponse } from './attendance.api';
import { getFullName, formatDate } from '../../utils/helpers';
import {
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  Printer,
  Sun,
  Sunset,
  Clock,
  Filter,
} from 'lucide-react';

type ViewMode = 'class-daily' | 'all-records';

interface AttendanceRecord {
  id: number;
  studentId: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    admissionNo: string;
    gender: string;
  };
  classId: number;
  class: {
    id: number;
    className: string;
    arm: string;
    level: string;
  };
  date: string;
  status: string;
  period: AttendancePeriod;
  createdAt: string;
}

const AttendanceView: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const { user } = useAuth();
  const { isAdmin, isFormTeacher } = useRole();
  const printRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('class-daily');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedPeriod, setSelectedPeriod] = useState<AttendancePeriod | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch classes for admin
  const { data: classesData } = useClassesQuery({ perPage: 100 });
  const classes = classesData?.data || [];

  // For form teachers, use their assigned class
  const formTeacherClassId = user?.formTeacherClassId;
  const formTeacherClassName = user?.formTeacherClassName;

  // Get class options based on role
  const classOptions = useMemo(() => {
    if (isFormTeacher && formTeacherClassId) {
      return [{ value: formTeacherClassId.toString(), label: formTeacherClassName || 'My Class' }];
    }
    return classes.map((c: any) => ({
      value: c.id.toString(),
      label: `${c.className || c.class_name} ${c.arm}`,
    }));
  }, [classes, isFormTeacher, formTeacherClassId, formTeacherClassName]);

  // Auto-select class for form teachers
  useEffect(() => {
    if (isFormTeacher && formTeacherClassId && !selectedClass) {
      setSelectedClass(formTeacherClassId.toString());
    }
  }, [isFormTeacher, formTeacherClassId, selectedClass]);

  // Load attendance status when class and date are selected
  useEffect(() => {
    const loadStatus = async () => {
      if (!selectedClass || !selectedDate) return;

      try {
        const response = await attendanceApi.getAttendanceStatus(
          parseInt(selectedClass),
          selectedDate
        );
        if (response.data.success) {
          setAttendanceStatus(response.data.data);
        }
      } catch (err) {
        setAttendanceStatus(null);
      }
    };

    loadStatus();
  }, [selectedClass, selectedDate]);

  // Load attendance records
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedClass || !selectedDate) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await attendanceApi.getClassByDate(
          parseInt(selectedClass),
          selectedDate
        );

        if (response.data.success) {
          let records = response.data.data || [];
          
          // Filter by period if selected
          if (selectedPeriod) {
            records = records.filter((r: any) => r.period === selectedPeriod);
          }
          
          setAttendanceData(records);
        }
      } catch (err: any) {
        console.error('Error loading attendance:', err);
        setError('Failed to load attendance records');
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === 'class-daily') {
      loadAttendance();
    }
  }, [selectedClass, selectedDate, selectedPeriod, viewMode]);

  // Load all records for admin view
  useEffect(() => {
    const loadAllRecords = async () => {
      if (viewMode !== 'all-records') return;

      setIsLoading(true);
      setError(null);

      try {
        const params: any = {
          page: 1,
          perPage: 100,
        };

        if (selectedClass) params.classId = parseInt(selectedClass);
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedPeriod) params.period = selectedPeriod;

        const response = await attendanceApi.getAll(params);

        if (response.data.success) {
          setAttendanceData(response.data.data || []);
        }
      } catch (err: any) {
        console.error('Error loading attendance:', err);
        setError('Failed to load attendance records');
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllRecords();
  }, [viewMode, selectedClass, startDate, endDate, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (attendanceData.length === 0) return null;

    const present = attendanceData.filter((r) => r.status === 'Present').length;
    const absent = attendanceData.filter((r) => r.status === 'Absent').length;
    const late = attendanceData.filter((r) => r.status === 'Late').length;
    const excused = attendanceData.filter((r) => r.status === 'Excused').length;
    const total = attendanceData.length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : '0';

    return { present, absent, late, excused, total, percentage };
  }, [attendanceData]);

  // Download CSV
  const handleDownload = () => {
    if (attendanceData.length === 0) {
      alert('No data to download');
      return;
    }

    const className = classOptions.find((c) => c.value === selectedClass)?.label || '';
    let csvContent = `Attendance Report\n`;
    csvContent += `Class: ${className}\n`;
    csvContent += `Date: ${formatDate(selectedDate)}\n`;
    if (selectedPeriod) csvContent += `Period: ${selectedPeriod}\n`;
    csvContent += `\n`;
    csvContent += `S/N,Admission No,Student Name,Gender,Period,Status\n`;

    attendanceData.forEach((record, index) => {
      const studentName = getFullName(record.student?.firstName, record.student?.lastName);
      csvContent += `${index + 1},${record.student?.admissionNo || ''},"${studentName}",${record.student?.gender || ''},${record.period},${record.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${selectedClass}_${selectedDate}.csv`;
    link.click();
  };

  // Print attendance
  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const executePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const className = classOptions.find((c) => c.value === selectedClass)?.label || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${className}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
            .info { margin-bottom: 15px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .present { color: green; }
            .absent { color: red; }
            .late { color: orange; }
            .stats { margin-top: 20px; display: flex; gap: 20px; }
            .stat-box { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>School Management System</h1>
            <h2>Attendance Report</h2>
          </div>
          <div class="info">
            <p><strong>Class:</strong> ${className}</p>
            <p><strong>Date:</strong> ${formatDate(selectedDate)}</p>
            ${selectedPeriod ? `<p><strong>Period:</strong> ${selectedPeriod}</p>` : ''}
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th>Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceData.map((record, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${record.student?.admissionNo || ''}</td>
                  <td>${getFullName(record.student?.firstName, record.student?.lastName)}</td>
                  <td>${record.student?.gender || ''}</td>
                  <td>${record.period}</td>
                  <td class="${record.status.toLowerCase()}">${record.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${stats ? `
            <div class="stats">
              <div class="stat-box"><strong>Total:</strong> ${stats.total}</div>
              <div class="stat-box present"><strong>Present:</strong> ${stats.present}</div>
              <div class="stat-box absent"><strong>Absent:</strong> ${stats.absent}</div>
              <div class="stat-box late"><strong>Late:</strong> ${stats.late}</div>
              <div class="stat-box"><strong>Attendance Rate:</strong> ${stats.percentage}%</div>
            </div>
          ` : ''}
          <div class="footer">
            <p>Printed from School Management System Management System</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    setShowPrintModal(false);
  };

  // Period filter options
  const periodOptions = [
    { value: '', label: 'All Periods' },
    { value: 'Morning', label: 'Morning' },
    { value: 'Afternoon', label: 'Afternoon' },
  ];

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
      render: (_: any, row: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={getFullName(row.student?.firstName, row.student?.lastName)}
            size="sm"
          />
          <div>
            <p className="font-medium text-secondary-900">
              {getFullName(row.student?.firstName, row.student?.lastName)}
            </p>
            <p className="text-xs text-secondary-500">{row.student?.admissionNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (_: any, row: AttendanceRecord) => (
        <Badge variant={row.student?.gender === 'Male' ? 'info' : 'secondary'} size="sm">
          {row.student?.gender}
        </Badge>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      render: (_: any, row: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          {row.period === 'Morning' ? (
            <Sun className="h-4 w-4 text-yellow-500" />
          ) : (
            <Sunset className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-secondary-700">{row.period}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: AttendanceRecord) => {
        const statusConfig: Record<string, { variant: any; icon: any }> = {
          Present: { variant: 'success', icon: CheckCircle },
          Absent: { variant: 'danger', icon: XCircle },
          Late: { variant: 'warning', icon: Clock },
          Excused: { variant: 'info', icon: Eye },
        };
        const config = statusConfig[row.status] || statusConfig.Present;
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} size="sm">
            <Icon className="h-3 w-3 mr-1" />
            {row.status}
          </Badge>
        );
      },
    },
  ];

  // Add class column for all-records view
  const allRecordsColumns = [
    columns[0], // S/N
    {
      key: 'class',
      label: 'Class',
      render: (_: any, row: AttendanceRecord) => (
        <span className="text-secondary-700">
          {row.class?.className} {row.class?.arm}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (_: any, row: AttendanceRecord) => (
        <span className="text-secondary-700">{formatDate(row.date)}</span>
      ),
    },
    ...columns.slice(1), // Rest of columns
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">View Attendance</h1>
          <p className="text-secondary-500 mt-1">
            {isAdmin ? 'View and print all attendance records' : 'View attendance records for your class'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={attendanceData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {isAdmin && (
            <Button
              onClick={handlePrint}
              disabled={attendanceData.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* View Mode Selection (Admin Only) */}
      {isAdmin && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Button
                variant={viewMode === 'class-daily' ? 'primary' : 'outline'}
                onClick={() => {
                  setViewMode('class-daily');
                  setAttendanceData([]);
                  setError(null);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Class Daily View
              </Button>
              <Button
                variant={viewMode === 'all-records' ? 'primary' : 'outline'}
                onClick={() => {
                  setViewMode('all-records');
                  setAttendanceData([]);
                  setError(null);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                All Records
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'class-daily' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Class"
                options={classOptions}
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="Select class"
                disabled={isFormTeacher && !!formTeacherClassId}
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={today}
                    className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <Select
                label="Period"
                options={periodOptions}
                value={selectedPeriod}
                onChange={(v) => setSelectedPeriod(v as AttendancePeriod | '')}
                placeholder="All Periods"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Class"
                options={[{ value: '', label: 'All Classes' }, ...classOptions]}
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="All Classes"
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || today}
                  className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={today}
                  className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <Select
                label="Period"
                options={periodOptions}
                value={selectedPeriod}
                onChange={(v) => setSelectedPeriod(v as AttendancePeriod | '')}
                placeholder="All Periods"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Status Card */}
      {viewMode === 'class-daily' && selectedClass && attendanceStatus && (
        <Card className="border-2 border-primary-100">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-secondary-900">Attendance Status:</h3>
                <div className="flex gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    attendanceStatus.hasMorning 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-secondary-100 text-secondary-500'
                  }`}>
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Morning</span>
                    {attendanceStatus.hasMorning && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    attendanceStatus.hasAfternoon 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-secondary-100 text-secondary-500'
                  }`}>
                    <Sunset className="h-4 w-4" />
                    <span className="text-sm font-medium">Afternoon</span>
                    {attendanceStatus.hasAfternoon && <CheckCircle className="h-4 w-4" />}
                  </div>
                </div>
              </div>
              <div>
                {attendanceStatus.isComplete ? (
                  <Badge variant="success" size="lg">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="warning" size="lg">
                    Incomplete
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-5 w-5 text-secondary-400" />
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-xs text-secondary-500">Total Records</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-secondary-500">Present</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-secondary-500">Absent</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-secondary-500">Late</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Eye className="h-5 w-5 text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-primary-600">{stats.percentage}%</p>
              <p className="text-xs text-secondary-500">Attendance Rate</p>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'class-daily' 
              ? `Attendance Records - ${formatDate(selectedDate)}`
              : 'All Attendance Records'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-secondary-600">Loading attendance data...</span>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">
                {!selectedClass 
                  ? 'Select a class to view attendance'
                  : 'No attendance records found for the selected criteria'
                }
              </p>
            </div>
          ) : (
            <div ref={printRef}>
              <Table
                columns={viewMode === 'all-records' ? allRecordsColumns : columns}
                data={attendanceData}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Preview Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Print Attendance Report"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPrintModal(false)}>
              Cancel
            </Button>
            <Button onClick={executePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info" title="Print Preview">
            The attendance report will be printed with the following details:
          </Alert>
          
          <div className="p-4 bg-secondary-50 rounded-lg space-y-2">
            <p><strong>Class:</strong> {classOptions.find((c) => c.value === selectedClass)?.label}</p>
            <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
            {selectedPeriod && <p><strong>Period:</strong> {selectedPeriod}</p>}
            <p><strong>Total Records:</strong> {attendanceData.length}</p>
            {stats && (
              <>
                <p><strong>Present:</strong> {stats.present} | <strong>Absent:</strong> {stats.absent}</p>
                <p><strong>Attendance Rate:</strong> {stats.percentage}%</p>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceView;
