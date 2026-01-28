import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Alert } from '../../components/common';
import { APP_NAME } from '../../utils/constants';
import { GraduationCap, Eye, EyeOff, User, Lock } from 'lucide-react';
import api from '../../services/axios';
import RoleSelectionModal from './RoleSelectionModal';
import { authApi } from './auth.api';

interface PublicStats {
  students: number;
  teachers: number;
  classes: number;
}

interface RoleSelectionState {
  isOpen: boolean;
  availableRoles: string[];
  formTeacherClassName: string | null;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, user, token } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [stats, setStats] = useState<PublicStats>({ students: 0, teachers: 0, classes: 0 });
  const [roleSelection, setRoleSelection] = useState<RoleSelectionState>({
    isOpen: false,
    availableRoles: [],
    formTeacherClassName: null,
  });
  const [isSelectingRole, setIsSelectingRole] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Fetch public stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/public-stats');
        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Only redirect if truly authenticated (has both user and token)
  if (isAuthenticated && user && token) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // First, check if role selection is needed
      console.log('🔐 [LOGIN] Attempting login for:', username);
      const response = await authApi.login({ username, password });
      console.log('🔐 [LOGIN] Response:', response);
      
      if (response.requiresRoleSelection && response.availableRoles && response.availableRoles.length > 1) {
        // Show role selection modal
        console.log('🔐 [LOGIN] Multiple roles detected, showing modal:', response.availableRoles);
        setRoleSelection({
          isOpen: true,
          availableRoles: response.availableRoles,
          formTeacherClassName: response.user?.formTeacherClassName || null,
        });
        return; // Important: stop here, don't proceed with login
      } else {
        // Single role or no selection needed - proceed with login
        console.log('🔐 [LOGIN] Single role, proceeding with login');
        await login({ username, password });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('🔐 [LOGIN] Error:', err);
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      setError(message);
    }
  };

  const handleRoleSelect = async (selectedRole: 'Subject Teacher' | 'Form Teacher') => {
    setIsSelectingRole(true);
    setError('');
    
    try {
      // Login with selected role
      await login({ username, password, selectedRole });
      setRoleSelection({ isOpen: false, availableRoles: [], formTeacherClassName: null });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setRoleSelection({ isOpen: false, availableRoles: [], formTeacherClassName: null });
    } finally {
      setIsSelectingRole(false);
    }
  };

  const handleCancelRoleSelection = () => {
    setRoleSelection({ isOpen: false, availableRoles: [], formTeacherClassName: null });
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={roleSelection.isOpen}
        availableRoles={roleSelection.availableRoles}
        formTeacherClassName={roleSelection.formTeacherClassName}
        onSelectRole={handleRoleSelect}
        onCancel={handleCancelRoleSelection}
        isLoading={isSelectingRole}
      />

      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md">
          
          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-900">Welcome back</h2>
            <p className="mt-2 text-secondary-600">
              Please sign in to your account to continue
            </p>
          </div>

          {/* Demo credentials notice */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-sm text-primary-800 font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs text-primary-700 space-y-1">
              <p><strong>Admin:</strong> admin / Admin@123</p>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6">
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="h-5 w-5" />}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="mb-8">
            <GraduationCap className="h-24 w-24 mx-auto opacity-90" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Armburu Model School Management System
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Manage student results, attendance, and academic records efficiently and effectively.
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">{stats.students || '—'}</div>
              <div className="text-sm text-primary-200">Students</div>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">{stats.teachers || '—'}</div>
              <div className="text-sm text-primary-200">Teachers</div>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">{stats.classes || '—'}</div>
              <div className="text-sm text-primary-200">Classes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
