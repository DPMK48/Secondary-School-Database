import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Alert, useToast, CredentialsModal } from '../../components/common';
import type { Class, ClassArm, ClassLevel } from '../../types';
import { Save, X } from 'lucide-react';
import { useCreateClassMutation, useUpdateClassMutation } from '../../hooks/useClasses';
import { useTeachersQuery } from '../../hooks/useTeachers';

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: Class | null;
}

const ClassForm: React.FC<ClassFormProps> = ({ isOpen, onClose, classData }) => {
  const isEdit = !!classData;
  const toast = useToast();
  
  const createMutation = useCreateClassMutation();
  const updateMutation = useUpdateClassMutation();
  const { data: teachersData } = useTeachersQuery({});

  const [formData, setFormData] = useState({
    class_name: '',
    arm: 'A' as ClassArm,
    level: 'Junior' as ClassLevel,
    form_teacher_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (classData) {
      setFormData({
        class_name: classData.className || classData.class_name || '',
        arm: classData.arm || 'A',
        level: classData.level || 'Junior',
        form_teacher_id: classData.form_teacher?.id?.toString() || '',
      });
    } else {
      // Reset form for new class
      setFormData({
        class_name: '',
        arm: 'A',
        level: 'Junior',
        form_teacher_id: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [classData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.class_name.trim()) {
      newErrors.class_name = 'Class name is required';
    }
    if (!formData.arm) {
      newErrors.arm = 'Class arm is required';
    }
    if (!formData.level) {
      newErrors.level = 'Class level is required';
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
        className: formData.class_name,
        arm: formData.arm,
        level: formData.level,
      };

      // Only include formTeacherId if it's provided
      if (formData.form_teacher_id) {
        dataToSave.formTeacherId = parseInt(formData.form_teacher_id);
      }

      let response;
      if (isEdit && classData) {
        response = await updateMutation.mutateAsync({ id: classData.id, data: dataToSave });
        toast.success(`Class ${formData.class_name} ${formData.arm} updated successfully!`);
      } else {
        response = await createMutation.mutateAsync(dataToSave);
        toast.success(`Class ${formData.class_name} ${formData.arm} created successfully!`);
      }
      
      // Always show credentials if a form teacher was assigned or updated
      if (formData.form_teacher_id && response?.credentials) {
        setGeneratedCredentials(response.credentials);
        setShowCredentials(true);
        // Don't close the modal yet, let the user see credentials first
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving class:', error);
      setSubmitError(error?.response?.data?.message || error?.message || 'Failed to save class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setGeneratedCredentials(null);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Get the selected teacher name for credentials modal
  const getSelectedTeacherName = () => {
    const teacher = teachersData?.data?.find(
      (t) => t.id.toString() === formData.form_teacher_id
    );
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : '';
  };

  const getSelectedTeacherEmail = () => {
    const teacher = teachersData?.data?.find(
      (t) => t.id.toString() === formData.form_teacher_id
    );
    return teacher?.email || '';
  };

  const teacherOptions = teachersData?.data?.map((teacher) => ({
    value: teacher.id.toString(),
    label: `${teacher.firstName} ${teacher.lastName}`,
  })) || [];

  const armOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  const levelOptions = [
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Class' : 'Add New Class'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="error" onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}
        
        <div className="space-y-4">
          <Input
            label="Class Name"
            placeholder="e.g., JSS1, SS2"
            value={formData.class_name}
            onChange={(e) => handleChange('class_name', e.target.value)}
            error={errors.class_name}
            required
            helperText="Example: JSS1 (Junior Secondary School 1), SS2 (Senior Secondary 2)"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              options={levelOptions}
              value={formData.level}
              onChange={(value) => handleChange('level', value)}
              error={errors.level}
              placeholder="Select level"
              required
            />
            
            <Select
              label="Arm"
              options={armOptions}
              value={formData.arm}
              onChange={(value) => handleChange('arm', value)}
              error={errors.arm}
              placeholder="Select arm"
              required
            />
          </div>

          <Select
            label="Form Teacher (Optional)"
            options={teacherOptions}
            value={formData.form_teacher_id}
            onChange={(value) => handleChange('form_teacher_id', value)}
            placeholder="Select form teacher"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </form>

      {/* Credentials Modal */}
      {showCredentials && generatedCredentials && (
        <CredentialsModal
          isOpen={showCredentials}
          onClose={handleCredentialsClose}
          credentials={generatedCredentials}
          teacherEmail={getSelectedTeacherEmail()}
          teacherName={getSelectedTeacherName()}
          role="form_teacher"
          emailSent={false}
        />
      )}
    </Modal>
  );
};

export default ClassForm;
