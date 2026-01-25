import { useAuthStore } from '../store';

export function useAuth() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    checkAuth,
    impersonate,
    exitImpersonation,
    originalUser,
    isImpersonating,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    impersonate,
    exitImpersonation,
    originalUser,
    isImpersonating,
    isAdmin: user?.role === 'Admin',
    isFormTeacher: user?.role === 'Form Teacher',
    isSubjectTeacher: user?.role === 'Subject Teacher',
    teacherId: user?.teacherId,
    studentId: user?.studentId,
  };
}

export default useAuth;
