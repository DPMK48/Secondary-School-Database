import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert, Select } from '../../components/common';
import { Lock, Bell, Calendar, School, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
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
    current_session: '2024/2025',
    current_term: '1',
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
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

    console.log('Changing password...');
    // TODO: Call API to change password
    
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleNotificationToggle = (field: string) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleSystemSettingChange = (field: string, value: string) => {
    setSystemSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSystemSettings = () => {
    console.log('Saving system settings:', systemSettings);
    // TODO: Call API to save system settings
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sessionOptions = [
    { value: '2023/2024', label: '2023/2024' },
    { value: '2024/2025', label: '2024/2025' },
    { value: '2025/2026', label: '2025/2026' },
  ];

  const termOptions = [
    { value: '1', label: 'First Term' },
    { value: '2', label: 'Second Term' },
    { value: '3', label: 'Third Term' },
  ];

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
              
              <Button type="submit" className="w-full" leftIcon={<Save className="h-4 w-4" />}>
                Update Password
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
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Current Academic Session"
                  options={sessionOptions}
                  value={systemSettings.current_session}
                  onChange={(value) => handleSystemSettingChange('current_session', value)}
                />
                <Select
                  label="Current Term"
                  options={termOptions}
                  value={systemSettings.current_term}
                  onChange={(value) => handleSystemSettingChange('current_term', value)}
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveSystemSettings} leftIcon={<Save className="h-4 w-4" />}>
                  Save System Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Version</p>
              <p className="font-medium text-secondary-900">1.0.0</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Last Updated</p>
              <p className="font-medium text-secondary-900">January 2026</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-500">Environment</p>
              <p className="font-medium text-secondary-900">Development</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
