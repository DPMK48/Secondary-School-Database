import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, type AttendanceFilters, type MarkAttendanceData, type BulkAttendanceData } from '../features/attendance/attendance.api';

const ATTENDANCE_QUERY_KEY = ['attendance'];

export const useAttendanceQuery = (
  filters?: AttendanceFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await attendanceApi.getAll(filters);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useAttendanceByDateQuery = (
  classId: number,
  date: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'class', classId, 'date', date],
    queryFn: async () => {
      const response = await attendanceApi.getClassByDate(classId, date);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!classId && !!date,
  });
};

export const useStudentAttendanceSummaryQuery = (
  studentId: number,
  params?: { term_id?: number; session_id?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'student', studentId, 'summary', params],
    queryFn: async () => {
      const response = await attendanceApi.getStudentSummary(studentId, params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!studentId,
  });
};

export const useClassAttendanceSummaryQuery = (
  classId: number,
  params?: { term_id?: number; session_id?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'class', classId, 'summary', params],
    queryFn: async () => {
      const response = await attendanceApi.getClassSummary(classId, params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!classId,
  });
};

export const useCreateAttendanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MarkAttendanceData) => {
      const response = await attendanceApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });
};

export const useBulkAttendanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkAttendanceData) => {
      const response = await attendanceApi.bulkCreate(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });
};

export const useUpdateAttendanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MarkAttendanceData> }) => {
      const response = await attendanceApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });
};

export const useDeleteAttendanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await attendanceApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });
};

export const useAttendanceStatusQuery = (
  classId: number,
  date: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'status', classId, date],
    queryFn: async () => {
      const response = await attendanceApi.getAttendanceStatus(classId, date);
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: options?.enabled !== false && !!classId && !!date,
  });
};
