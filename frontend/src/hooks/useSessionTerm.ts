import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.service';

/**
 * Hook to fetch current academic session
 * Returns the session data directly (extracts from { success, data } response)
 */
export const useCurrentSession = () => {
  const query = useQuery({
    queryKey: ['currentSession'],
    queryFn: settingsApi.getCurrentSession,
    staleTime: 0,
    refetchOnMount: true,
  });

  return {
    ...query,
    // Extract data from API response format { success: true, data: {...} }
    data: query.data?.data || query.data,
  };
};

/**
 * Hook to fetch current term
 * Returns the term data directly (extracts from { success, data } response)
 */
export const useCurrentTerm = () => {
  const query = useQuery({
    queryKey: ['currentTerm'],
    queryFn: settingsApi.getCurrentTerm,
    staleTime: 0,
    refetchOnMount: true,
  });

  return {
    ...query,
    // Extract data from API response format { success: true, data: {...} }
    data: query.data?.data || query.data,
  };
};

/**
 * Hook to fetch all sessions
 * Returns the sessions array directly (extracts from { success, data } response)
 */
export const useSessions = () => {
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: settingsApi.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    // Extract data from API response format { success: true, data: [...] }
    data: query.data?.data || query.data,
  };
};

/**
 * Hook to fetch all terms
 * Returns the terms array directly (extracts from { success, data } response)
 */
export const useTerms = () => {
  const query = useQuery({
    queryKey: ['terms'],
    queryFn: settingsApi.getTerms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    // Extract data from API response format { success: true, data: [...] }
    data: query.data?.data || query.data,
  };
};
/**
 * Combined hook for getting current session and term
 */
export const useSessionTerm = () => {
  const { data: sessionData, isLoading: isLoadingSession } = useCurrentSession();
  const { data: termData, isLoading: isLoadingTerm } = useCurrentTerm();

  return {
    // Data is already extracted by useCurrentSession and useCurrentTerm
    currentSession: sessionData || null,
    currentTerm: termData || null,
    isLoading: isLoadingSession || isLoadingTerm,
  };
};