import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi, type ResultFilters, type ScoreEntryData, type BulkScoreEntryData } from '../features/results/results.api';

const RESULTS_QUERY_KEY = ['results'];

export const useResultsQuery = (
  filters?: ResultFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [RESULTS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await resultsApi.getAll(filters);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useStudentResultSummaryQuery = (
  studentId: number,
  params?: { term_id?: number; session_id?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'student', studentId, 'summary', params],
    queryFn: async () => {
      const response = await resultsApi.getStudentSummary(studentId, params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!studentId,
  });
};

export const useClassResultSummaryQuery = (
  classId: number,
  params?: { term_id?: number; session_id?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'class', classId, 'summary', params],
    queryFn: async () => {
      const response = await resultsApi.getClassSummary(classId, params);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!classId,
  });
};

export const useSubjectResultsQuery = (
  params: { classId: number; subjectId: number; termId?: number; sessionId?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'subject', params],
    queryFn: async () => {
      const response = await resultsApi.getClassSubjectResults(params.classId, params.subjectId, {
        term_id: params.termId,
        session_id: params.sessionId,
      });
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.classId && !!params.subjectId,
  });
};

export const useTeacherResultsQuery = (
  teacherId: number,
  params?: { classId?: number; subjectId?: number; termId?: number; sessionId?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'teacher', teacherId, params],
    queryFn: async () => {
      const response = await resultsApi.getTeacherResults(teacherId, {
        class_id: params?.classId,
        subject_id: params?.subjectId,
        term_id: params?.termId,
        session_id: params?.sessionId,
      });
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!teacherId,
  });
};

export const useSubjectTeacherAssignmentsQuery = (
  teacherId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'teacher', teacherId, 'assignments'],
    queryFn: async () => {
      const response = await resultsApi.getSubjectTeacherAssignments(teacherId);
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!teacherId,
  });
};

export const useFormTeacherCompilationQuery = (
  classId: number,
  params?: { termId?: number; sessionId?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'form-teacher', classId, 'compilation', params],
    queryFn: async () => {
      const response = await resultsApi.getFormTeacherCompilation(classId, {
        term_id: params?.termId,
        session_id: params?.sessionId,
      });
      return response.data;
    },
    refetchOnMount: true, // Refetch when component mounts to get latest scores
    refetchOnWindowFocus: true, // Refetch when user focuses the window (tabs back)
    refetchOnReconnect: true, // Refetch when network reconnects
    staleTime: 30000, // Consider data stale after 30 seconds
    enabled: options?.enabled !== false && !!classId,
  });
};

export const useCreateResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScoreEntryData) => {
      const response = await resultsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_QUERY_KEY });
    },
  });
};

export const useBulkResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkScoreEntryData) => {
      const response = await resultsApi.bulkCreate(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_QUERY_KEY });
    },
  });
};

export const useBulkSubjectScoresMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      class_id: number;
      subject_id: number;
      teacher_id: number;
      session_id: number;
      term_id: number;
      scores: Array<{
        student_id: number;
        test1?: number;
        test2?: number;
        test3?: number;
        exam?: number;
      }>;
    }) => {
      const response = await resultsApi.bulkSaveSubjectScores(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_QUERY_KEY });
    },
  });
};

export const useApproveResultsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { classId: number; termId: number; sessionId: number; approvedBy: number }) => {
      const response = await resultsApi.approveResults({
        class_id: data.classId,
        term_id: data.termId,
        session_id: data.sessionId,
        approved_by: data.approvedBy,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_QUERY_KEY });
    },
  });
};

export const useLockResultsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { classId: number; termId: number; sessionId: number; lockedBy: number }) => {
      const response = await resultsApi.lockResults({
        class_id: data.classId,
        term_id: data.termId,
        session_id: data.sessionId,
        locked_by: data.lockedBy,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_QUERY_KEY });
    },
  });
};

export const useCheckResultsLockedQuery = (
  params: { classId: number; termId: number; sessionId: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...RESULTS_QUERY_KEY, 'locked', params],
    queryFn: async () => {
      const response = await resultsApi.checkLocked({
        class_id: params.classId,
        term_id: params.termId,
        session_id: params.sessionId,
      });
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false && !!params.classId && !!params.termId && !!params.sessionId,
  });
};
