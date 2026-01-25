import api from './axios';

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface SessionData {
  id: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface TermData {
  id: number;
  termName: string;
  sessionId: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  session?: SessionData;
}

export const settingsApi = {
  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post<any>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Get all academic sessions
   */
  getSessions: async () => {
    const response = await api.get<any>('/sessions');
    return response.data;
  },

  /**
   * Get current academic session
   */
  getCurrentSession: async () => {
    const response = await api.get<any>('/sessions/current');
    return response.data;
  },

  /**
   * Update session (set as current)
   */
  updateSession: async (id: number, data: any) => {
    const response = await api.patch<any>(`/sessions/${id}`, data);
    return response.data;
  },

  /**
   * Get all terms
   */
  getTerms: async () => {
    const response = await api.get<any>('/terms');
    return response.data;
  },

  /**
   * Get current term
   */
  getCurrentTerm: async () => {
    const response = await api.get<any>('/terms/current');
    return response.data;
  },

  /**
   * Update term (set as current)
   */
  updateTerm: async (id: number, data: any) => {
    const response = await api.patch<any>(`/terms/${id}`, data);
    return response.data;
  },

  /**
   * Set current session and term
   */
  setCurrentSessionAndTerm: async (sessionId: number, termId: number) => {
    await api.patch(`/sessions/${sessionId}`, { isCurrent: true });
    await api.patch(`/terms/${termId}`, { isCurrent: true });
    return { success: true };
  },
};
