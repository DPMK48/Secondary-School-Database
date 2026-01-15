import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../common';

interface DailyAttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface DailyAttendanceChartProps {
  data: DailyAttendanceData[];
  title?: string;
}

const COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f59e0b',
  excused: '#3b82f6',
};

export const DailyAttendanceChart: React.FC<DailyAttendanceChartProps> = ({
  data,
  title = 'Daily Attendance',
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke={COLORS.present}
                fill={COLORS.present}
                fillOpacity={0.8}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="late"
                stackId="1"
                stroke={COLORS.late}
                fill={COLORS.late}
                fillOpacity={0.8}
                name="Late"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke={COLORS.absent}
                fill={COLORS.absent}
                fillOpacity={0.8}
                name="Absent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface AttendanceSummaryData {
  status: string;
  count: number;
}

interface AttendanceSummaryChartProps {
  data: AttendanceSummaryData[];
  title?: string;
}

export const AttendanceSummaryChart: React.FC<AttendanceSummaryChartProps> = ({
  data,
  title = 'Attendance Summary',
}) => {
  const getColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return COLORS.present;
      case 'absent':
        return COLORS.absent;
      case 'late':
        return COLORS.late;
      case 'excused':
        return COLORS.excused;
      default:
        return '#6b7280';
    }
  };

  const dataWithColors = data.map((item) => ({
    ...item,
    color: getColor(item.status),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithColors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => `${dataWithColors[props.index].status} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {dataWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface MonthlyAttendanceData {
  month: string;
  percentage: number;
}

interface MonthlyAttendanceChartProps {
  data: MonthlyAttendanceData[];
  title?: string;
}

export const MonthlyAttendanceChart: React.FC<MonthlyAttendanceChartProps> = ({
  data,
  title = 'Monthly Attendance Rate',
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) => [`${value || 0}%`, 'Attendance Rate']}
              />
              <Legend />
              <Bar
                dataKey="percentage"
                fill="#6366f1"
                name="Attendance Rate"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface ClassAttendanceData {
  className: string;
  present: number;
  absent: number;
  late: number;
}

interface ClassComparisonChartProps {
  data: ClassAttendanceData[];
  title?: string;
}

export const ClassAttendanceComparisonChart: React.FC<ClassComparisonChartProps> = ({
  data,
  title = 'Class Attendance Comparison',
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="className"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill={COLORS.late} name="Late" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  DailyAttendanceChart,
  AttendanceSummaryChart,
  MonthlyAttendanceChart,
  ClassAttendanceComparisonChart,
};
