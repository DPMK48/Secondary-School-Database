import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Avatar, Alert } from '../../components/common';
import { getRoleDisplayName } from '../../utils/permissions';
import { getFullName } from '../../utils/helpers';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: 'John',
    last_name: 'Doe',
    email: user?.email || '',
    phone: '+234 123 456 7890',
    address: '123 School Lane, Lagos',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // TODO: Call API to update profile
    setShowSuccess(true);
    setIsEditing(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      first_name: 'John',
      last_name: 'Doe',
      email: user?.email || '',
      phone: '+234 123 456 7890',
      address: '123 School Lane, Lagos',
    });
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar
                firstName={formData.first_name}
                lastName={formData.last_name}
                size="xl"
              />
            </div>
            <h2 className="text-xl font-bold text-secondary-900">
              {getFullName(formData.first_name, formData.last_name)}
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
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    leftIcon={<User className="h-5 w-5" />}
                  />
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    leftIcon={<User className="h-5 w-5" />}
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
                  <Button variant="outline" onClick={handleCancel} leftIcon={<X className="h-4 w-4" />}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <User className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Full Name</p>
                    <p className="font-medium text-secondary-900">
                      {getFullName(formData.first_name, formData.last_name)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <Mail className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Email</p>
                    <p className="font-medium text-secondary-900">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <Phone className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Phone</p>
                    <p className="font-medium text-secondary-900">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-secondary-500">Address</p>
                    <p className="font-medium text-secondary-900">{formData.address}</p>
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
              <User className="h-5 w-5 text-secondary-500 mt-0.5" />
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
    </div>
  );
};

export default Profile;
