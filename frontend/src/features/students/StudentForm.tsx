import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Alert, useToast } from '../../components/common';
import type { Student, StudentStatus } from '../../types';
import { Save, X } from 'lucide-react';
import { useCreateStudentMutation, useUpdateStudentMutation } from '../../hooks/useStudents';
import { useClassesQuery } from '../../hooks/useClasses';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

const StudentForm: React.FC<StudentFormProps> = ({ isOpen, onClose, student }) => {
  const isEdit = !!student;
  const toast = useToast();
  
  const createMutation = useCreateStudentMutation();
  const updateMutation = useUpdateStudentMutation();
  const { data: classesData } = useClassesQuery({});

  const [formData, setFormData] = useState({
    admission_no: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    current_class_id: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (student) {
      setFormData({
        admission_no: student.admissionNo || student.admission_no || '',
        first_name: student.firstName || student.first_name || '',
        last_name: student.lastName || student.last_name || '',
        gender: student.gender || '',
        date_of_birth: student.dateOfBirth || student.date_of_birth || '',
        current_class_id: (student.currentClassId || student.current_class_id)?.toString() || '',
        guardian_name: student.guardianName || student.guardian_name || '',
        guardian_phone: student.guardianPhone || student.guardian_phone || '',
        address: student.address || '',
        status: student.status || 'Active',
      });
    } else {
      // Reset form for new student
      setFormData({
        admission_no: '',
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        current_class_id: '',
        guardian_name: '',
        guardian_phone: '',
        address: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.admission_no.trim()) {
      newErrors.admission_no = 'Admission number is required';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (!formData.current_class_id) {
      newErrors.current_class_id = 'Class is required';
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
    setSubmitError('');

    try {
      const dataToSave: any = {
        admissionNo: formData.admission_no,
        firstName: formData.first_name,
        lastName: formData.last_name,
        gender: formData.gender as 'Male' | 'Female',
        dateOfBirth: formData.date_of_birth,
        currentClassId: parseInt(formData.current_class_id),
        guardianName: formData.guardian_name,
        guardianPhone: formData.guardian_phone,
        address: formData.address,
      };

      // Only include status when editing
      if (isEdit) {
        dataToSave.status = formData.status as StudentStatus;
      }

      if (isEdit && student) {
        await updateMutation.mutateAsync({ id: student.student_id, data: dataToSave });
        toast.success(`Student ${formData.first_name} ${formData.last_name} updated successfully!`);
      } else {
        await createMutation.mutateAsync(dataToSave);
        toast.success(`Student ${formData.first_name} ${formData.last_name} added successfully!`);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      setSubmitError(error?.response?.data?.message || error?.message || 'Failed to save student');
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

  const classOptions = classesData?.data?.map((cls) => ({
    value: cls.id?.toString() || '',
    label: `${cls.className || cls.class_name || ''} ${cls.arm || ''}`.trim(),
  })) || [];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Graduated', label: 'Graduated' },
    { value: 'Transferred', label: 'Transferred' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student' : 'Add New Student'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="error" onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}
        
        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admission Number"
              placeholder="e.g., STU2024001"
              value={formData.admission_no}
              onChange={(e) => handleChange('admission_no', e.target.value)}
              error={errors.admission_no}
              required
            />
            <Select
              label="Class"
              options={classOptions}
              value={formData.current_class_id}
              onChange={(value) => handleChange('current_class_id', value)}
              error={errors.current_class_id}
              placeholder="Select class"
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
            <Select
              label="Gender"
              options={genderOptions}
              value={formData.gender}
              onChange={(value) => handleChange('gender', value)}
              error={errors.gender}
              placeholder="Select gender"
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              error={errors.date_of_birth}
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

        {/* Guardian Information */}
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-4">Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Guardian Name"
              placeholder="Enter guardian name"
              value={formData.guardian_name}
              onChange={(e) => handleChange('guardian_name', e.target.value)}
            />
            <Input
              label="Guardian Phone"
              placeholder="e.g., +234 123 456 7890"
              value={formData.guardian_phone}
              onChange={(e) => handleChange('guardian_phone', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Address
            </label>
            <textarea
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
              placeholder="Enter student address"
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentForm;
