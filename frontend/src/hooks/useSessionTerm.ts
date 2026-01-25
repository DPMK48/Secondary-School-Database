import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.service';

/**
 * Hook to fetch current academic session
 */
export const useCurrentSession = () => {
  return useQuery({
    queryKey: ['currentSession'],
    queryFn: settingsApi.getCurrentSession,
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * Hook to fetch current term
 */
export const useCurrentTerm = () => {
  return useQuery({
    queryKey: ['currentTerm'],
    queryFn: settingsApi.getCurrentTerm,
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * Hook to fetch all sessions
 */
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: settingsApi.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all terms
 */
export const useTerms = () => {
  return useQuery({
    queryKey: ['terms'],
    queryFn: settingsApi.getTerms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
/**
 * Combined hook for getting current session and term
 */
export const useSessionTerm = () => {
  const { data: sessionData, isLoading: isLoadingSession } = useCurrentSession();
  const { data: termData, isLoading: isLoadingTerm } = useCurrentTerm();

  return {
    currentSession: sessionData?.data || null,
    currentTerm: termData?.data || null,
    isLoading: isLoadingSession || isLoadingTerm,
  };
};