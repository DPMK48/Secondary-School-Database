import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useInvalidateSessionTerm } from '../../hooks/useSessionTerm';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert, Select, useToast, Spinner } from '../../components/common';
import { Lock, Bell, Calendar, School, Save } from 'lucide-react';
import { settingsApi, type SessionData, type TermData } from '../../services/settings.service';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const invalidateSessionTerm = useInvalidateSessionTerm();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [terms, setTerms] = useState<TermData[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [currentTerm, setCurrentTerm] = useState<TermData | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    result_notifications: true,
    attendance_notifications: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    current_session: '',
    current_term: '',
  });

  // Load sessions and terms on mount
  useEffect(() => {
    loadSessionsAndTerms();
  }, []);

  const loadSessionsAndTerms = async () => {
    try {
      setIsLoadingSessions(true);
      const [sessionsResponse, termsResponse, currentSessionResponse, currentTermResponse] = await Promise.allSettled([
        settingsApi.getSessions(),
        settingsApi.getTerms(),
        settingsApi.getCurrentSession(),
        settingsApi.getCurrentTerm(),
      ]);

      if (sessionsResponse.status === 'fulfilled') {
        setSessions(sessionsResponse.value.data);
      }

      if (termsResponse.status === 'fulfilled') {
        setTerms(termsResponse.value.data);
      }

      if (currentSessionResponse.status === 'fulfilled') {
        const session = currentSessionResponse.value.data;
        setCurrentSession(session);
        setSystemSettings((prev) => ({ ...prev, current_session: session.id.toString() }));
      }

      if (currentTermResponse.status === 'fulfilled') {
        const term = currentTermResponse.value.data;
        setCurrentTerm(term);
        setSystemSettings((prev) => ({ ...prev, current_term: term.id.toString() }));
      }
    } catch (error) {
      console.error('Error loading sessions and terms:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsLoadingPassword(true);
      await settingsApi.changePassword({
        oldPassword: passwordData.current_password,
        newPassword: passwordData.new_password,
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleNotificationToggle = (field: string) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleSystemSettingChange = (field: string, value: string) => {
    setSystemSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSystemSettings = async () => {
    try {
      setIsLoadingSystem(true);
      const sessionId = parseInt(systemSettings.current_session);
      const termId = parseInt(systemSettings.current_term);

      if (!sessionId || !termId) {
        toast.error('Please select both session and term');
        return;
      }

      await settingsApi.setCurrentSessionAndTerm(sessionId, termId);
      
      // Reload current session and term
      await loadSessionsAndTerms();
      
      // Invalidate React Query cache so all dashboards see the new session/term
      invalidateSessionTerm();
      
      toast.success('Current session and term updated successfully!');
    } catch (error: any) {
      console.error('Error saving system settings:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update system settings';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  // Generate options from loaded data
  const sessionOptions = sessions.map((session) => ({
    value: session.id.toString(),
    label: session.sessionName,
  }));

  const termOptions = terms
    .filter((term) => term.sessionId.toString() === systemSettings.current_session)
    .map((term) => ({
      value: term.id.toString(),
      label: term.termName,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-500 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert variant="success" onClose={() => setShowSuccess(false)}>
          Settings updated successfully!
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <Alert variant="error">{passwordError}</Alert>}
              
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordData.current_password}
                onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
              />
              
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={passwordData.new_password}
                onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirm_password}
                onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
              />
              
              <Button type="submit" className="w-full" leftIcon={<Save className="h-4 w-4" />} disabled={isLoadingPassword}>
                {isLoadingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Email Notifications</p>
                  <p className="text-sm text-secondary-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('email_notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.email_notifications ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Result Notifications</p>
                  <p className="text-sm text-secondary-500">Notify when results are published</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('result_notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.result_notifications ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.result_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Attendance Notifications</p>
                  <p className="text-sm text-secondary-500">Notify about attendance updates</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('attendance_notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.attendance_notifications ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.attendance_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Settings (Admin Only) */}
      {user?.role === 'Admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {currentSession && currentTerm && (
                  <Alert variant="info">
                    <strong>Current:</strong> {currentSession.sessionName} - {currentTerm.termName}
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Current Academic Session"
                    options={sessionOptions}
                    value={systemSettings.current_session}
                    onChange={(value) => handleSystemSettingChange('current_session', value)}
                    placeholder="Select session"
                  />
                  <Select
                    label="Current Term"
                    options={termOptions}
                    value={systemSettings.current_term}
                    onChange={(value) => handleSystemSettingChange('current_term', value)}
                    placeholder="Select term"
                    disabled={!systemSettings.current_session}
                  />
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSaveSystemSettings} 
                    leftIcon={<Save className="h-4 w-4" />}
                    disabled={isLoadingSystem || !systemSettings.current_session || !systemSettings.current_term}
                  >
                    {isLoadingSystem ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
