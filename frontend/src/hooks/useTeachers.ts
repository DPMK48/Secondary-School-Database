import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi, type TeacherFilters, type CreateTeacherData, type UpdateTeacherData, type AssignSubjectClassData } from '../features/teachers/teachers.api';

const TEACHERS_QUERY_KEY = ['teachers'];

export const useTeachersQuery = (
  filters?: TeacherFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [TEACHERS_QUERY_KEY, filters],
    queryFn: () => teachersApi.getAll(filters),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useTeacherQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...TEACHERS_QUERY_KEY, id],
    queryFn: () => teachersApi.getById(id),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useCreateTeacherMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherData) => teachersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
  });
};

export const useUpdateTeacherMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeacherData }) =>
      teachersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
  });
};

export const useDeleteTeacherMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teachersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
  });
};

export const useTeacherAssignmentsQuery = (teacherId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...TEACHERS_QUERY_KEY, teacherId, 'assignments'],
    queryFn: () => teachersApi.getClasses(teacherId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useAssignSubjectClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignSubjectClassData) => teachersApi.assignSubjectClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
  });
};

export const useUnassignSubjectClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) =>
      teachersApi.removeAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
  });
};