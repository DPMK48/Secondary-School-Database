import React, { useState } from 'react';
import { Modal, Button } from './index';
import { Eye, EyeOff, Copy, Check, School, X as CloseIcon } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    username: string;
    password: string;
  };
  teacherEmail: string;
  teacherName: string;
  role: 'subject_teacher' | 'form_teacher';
  emailSent?: boolean;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  teacherEmail,
  teacherName,
  role,
  emailSent = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const roleLabel = role === 'form_teacher' ? 'Form Teacher' : 'Subject Teacher';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${roleLabel} Login Credentials`} size="md">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Login Credentials Generated</h3>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Teacher:</strong> {teacherName}
            </p>
            <p>
              <strong>Email:</strong> {teacherEmail}
            </p>
            <p>
              <strong>Role:</strong> {roleLabel}
            </p>
            {emailSent && (
              <p className="text-green-700 font-medium mt-2">
                ✓ Credentials have been sent to the teacher's email
              </p>
            )}
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
                {credentials.username}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(credentials.username, 'username')}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
                {showPassword ? credentials.password : '••••••••••'}
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
                onClick={() => handleCopy(credentials.password, 'password')}
              >
                {copiedField === 'password' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please save these credentials securely. The teacher will need
            them to log in to the system.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CredentialsModal;
