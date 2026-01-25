import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi, type SubjectFilters, type CreateSubjectData, type UpdateSubjectData } from '../features/subjects/subjects.api';

const SUBJECTS_QUERY_KEY = ['subjects'];

export const useSubjectsQuery = (
  filters?: SubjectFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [SUBJECTS_QUERY_KEY, filters],
    queryFn: () => subjectsApi.getAll(filters),
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useSubjectQuery = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...SUBJECTS_QUERY_KEY, id],
    queryFn: () => subjectsApi.getById(id),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== false,
  });
};

export const useCreateSubjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectData) => subjectsApi.create(data),
    onSuccess: () => {
      // Invalidate all subjects queries to refetch
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
      // Also refetch immediately
      queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};

export const useUpdateSubjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubjectData }) =>
      subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};

export const useDeleteSubjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => subjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};