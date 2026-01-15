import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal } from '../../components/common';
import type { Teacher } from '../../types';
import { Save, X } from 'lucide-react';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  teacher?: Teacher | null;
  onSave: (data: Partial<Teacher>) => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ isOpen, onClose, teacher, onSave }) => {
  const isEdit = !!teacher;

  const [formData, setFormData] = useState({
    staff_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    employment_date: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        staff_id: teacher.staff_id || '',
        first_name: teacher.first_name || '',
        last_name: teacher.last_name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
        employment_date: teacher.employment_date || '',
        status: teacher.status || 'Active',
      });
    } else {
      // Reset form for new teacher
      setFormData({
        staff_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        employment_date: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [teacher, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_id.trim()) {
      newErrors.staff_id = 'Staff ID is required';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.employment_date) {
      newErrors.employment_date = 'Employment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Resigned', label: 'Resigned' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Teacher' : 'Add New Teacher'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Staff ID"
              placeholder="e.g., TCH2024001"
              value={formData.staff_id}
              onChange={(e) => handleChange('staff_id', e.target.value)}
              error={errors.staff_id}
              required
            />
            <Input
              label="Employment Date"
              type="date"
              value={formData.employment_date}
              onChange={(e) => handleChange('employment_date', e.target.value)}
              error={errors.employment_date}
              required
            />
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              error={errors.first_name}
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              error={errors.last_name}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="teacher@school.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              required
            />
            <Input
              label="Phone"
              placeholder="+234 123 456 7890"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              required
            />
            {isEdit && (
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleChange('status', value)}
              />
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-4">Additional Information</h3>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Address
            </label>
            <textarea
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
              placeholder="Enter teacher address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Teacher' : 'Add Teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeacherForm;
