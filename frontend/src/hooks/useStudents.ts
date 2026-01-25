import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, type StudentFilters, type CreateStudentData, type UpdateStudentData } from '../features/students/students.api';

const STUDENTS_QUERY_KEY = ['students'];

export const useStudentsQuery = (
  filters?: StudentFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [STUDENTS_QUERY_KEY, filters],
    queryFn: () => studentsApi.getAll(filters),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useStudentQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, id],
    queryFn: () => studentsApi.getById(id),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useCreateStudentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentData) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};

export const useUpdateStudentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentData }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};

export const useDeleteStudentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};