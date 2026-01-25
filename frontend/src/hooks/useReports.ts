import { useQuery } from '@tanstack/react-query';
import { reportsApi, type StudentReportParams, type ClassReportParams, type AttendanceReportParams, type ReportFilters } from '../features/reports/reports.api';

const REPORTS_QUERY_KEY = ['reports'];

export const useStudentReportQuery = (
  params: StudentReportParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'student', params],
    queryFn: async () => {
      const response = await reportsApi.getStudentReport(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.student_id,
  });
};

export const useClassReportQuery = (
  params: ClassReportParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'class', params],
    queryFn: async () => {
      const response = await reportsApi.getClassReport(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.class_id,
  });
};

export const useAttendanceReportQuery = (
  params: AttendanceReportParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'attendance', params],
    queryFn: async () => {
      const response = await reportsApi.getAttendanceReport(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.start_date && !!params.end_date,
  });
};

export const useAcademicPerformanceQuery = (
  params?: ReportFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'academic-performance', params],
    queryFn: async () => {
      const response = await reportsApi.getAcademicPerformance(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useTermSummaryQuery = (
  params: ReportFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'term-summary', params],
    queryFn: async () => {
      const response = await reportsApi.getTermSummary(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.term_id,
  });
};

export const useDashboardStatsQuery = (
  params?: { term_id?: number; session_id?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'dashboard-stats', params],
    queryFn: async () => {
      const response = await reportsApi.getDashboardStats(params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};
