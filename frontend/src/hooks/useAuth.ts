import { useAuthStore } from '../store';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    isAdmin: user?.role === 'admin',
    isFormTeacher: user?.role === 'form_teacher',
    isSubjectTeacher: user?.role === 'subject_teacher',
  };
}

export default useAuth;
