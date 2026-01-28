import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi, type ClassFilters, type CreateClassData, type UpdateClassData } from '../features/classes/classes.api';

const CLASSES_QUERY_KEY = ['classes'];

export const useClassesQuery = (
  filters?: ClassFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [CLASSES_QUERY_KEY, filters],
    queryFn: () => classesApi.getAll(filters),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useClassQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...CLASSES_QUERY_KEY, id],
    queryFn: () => classesApi.getById(id),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    enabled: options?.enabled !== false && id > 0,
  });
};

export const useCreateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassData) => classesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
};

export const useUpdateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassData }) =>
      classesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
};

export const useDeleteClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
    },
  });
};

export const useClassStudentsQuery = (
  classId: number,
  params?: { page?: number; perPage?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...CLASSES_QUERY_KEY, classId, 'students', params],
    queryFn: () => classesApi.getStudents(classId, params),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    enabled: options?.enabled !== false && classId > 0,
  });
};

export const useClassSubjectsQuery = (classId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...CLASSES_QUERY_KEY, classId, 'subjects'],
    queryFn: () => classesApi.getSubjects(classId),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    enabled: options?.enabled !== false && classId > 0,
  });
};