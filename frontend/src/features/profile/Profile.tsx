import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Avatar, Alert, Spinner } from '../../components/common';
import { getRoleDisplayName } from '../../utils/permissions';
import { getFullName } from '../../utils/helpers';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X, Key, Eye, EyeOff, Copy, Check, School, BookOpen } from 'lucide-react';
import api from '../../services/axios';

// School code for credential generation
const SCHOOL_CODE = 'ESS001'; // Excellence Secondary School

// Generate teacher credentials from email
const generateCredentials = (email: string) => {
  const username = email.split('@')[0];
  const password = `${SCHOOL_CODE}@2024`;
  return { username, password };
};

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const Profile: React.FC = () => {
  const { user, isFormTeacher, isSubjectTeacher } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Credentials display state
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Check if user is a teacher (Form Teacher or Subject Teacher)
  const isTeacher = isFormTeacher || isSubjectTeacher;
  
  // Copy text to clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const [originalData, setOriginalData] = useState<ProfileData>(formData);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Try to get profile data from API
      const response = await api.get('/auth/me');
      const profileData = response.data;
      
      const data: ProfileData = {
        firstName: profileData.firstName || profileData.first_name || '',
        lastName: profileData.lastName || profileData.last_name || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
      };
      
      setFormData(data);
      setOriginalData(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      // Use user data as fallback
      const data: ProfileData = {
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
      };
      setFormData(data);
      setOriginalData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await api.patch('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      
      setOriginalData(formData);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Profile</h1>
          <p className="text-secondary-500 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert variant="success" onClose={() => setShowSuccess(false)}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar
                firstName={formData.firstName}
                lastName={formData.lastName}
                size="xl"
              />
            </div>
            <h2 className="text-xl font-bold text-secondary-900">
              {getFullName(formData.firstName, formData.lastName) || user?.username}
            </h2>
            <p className="text-secondary-500 mt-1">{user?.username}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              {user?.role ? getRoleDisplayName(user.role) : 'User'}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    leftIcon={<UserIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    leftIcon={<UserIcon className="h-5 w-5" />}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  leftIcon={<Mail className="h-5 w-5" />}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  leftIcon={<Phone className="h-5 w-5" />}
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancel} leftIcon={<X className="h-4 w-4" />} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} leftIcon={<Save className="h-4 w-4" />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Full Name</p>
                    <p className="font-medium text-secondary-900">
                      {getFullName(formData.firstName, formData.lastName) || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <Mail className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Email</p>
                    <p className="font-medium text-secondary-900">{formData.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <Phone className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Phone</p>
                    <p className="font-medium text-secondary-900">{formData.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Address</p>
                    <p className="font-medium text-secondary-900">{formData.address || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
              <UserIcon className="h-5 w-5 text-secondary-500 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Username</p>
                <p className="font-medium text-secondary-900">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
              <Shield className="h-5 w-5 text-secondary-500 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Role</p>
                <p className="font-medium text-secondary-900">
                  {user?.role ? getRoleDisplayName(user.role) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
              <Calendar className="h-5 w-5 text-secondary-500 mt-0.5" />
              <div>
                <p className="text-sm text-secondary-500">Member Since</p>
                <p className="font-medium text-secondary-900">January 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Credentials - Only shown for Teachers */}
      {isTeacher && formData.email && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary-600" />
              Login Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Role Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isFormTeacher && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                    <School className="h-4 w-4 mr-1" />
                    Form Teacher
                  </span>
                )}
                {isSubjectTeacher && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Subject Teacher
                  </span>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Username</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg font-mono text-sm">
                    {generateCredentials(formData.email).username}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(generateCredentials(formData.email).username, 'username')}
                  >
                    {copiedField === 'username' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg font-mono text-sm">
                    {showPassword ? generateCredentials(formData.email).password : '••••••••••'}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(generateCredentials(formData.email).password, 'password')}
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Info Notice */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> If you have changed your password, the password shown here is your initial password and may no longer be valid.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
