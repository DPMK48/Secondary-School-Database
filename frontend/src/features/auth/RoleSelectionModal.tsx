import React, { useEffect } from 'react';
import { Users, GraduationCap, School, Loader2 } from 'lucide-react';
import { Button } from '../../components/common';

interface RoleSelectionModalProps {
  isOpen: boolean;
  availableRoles: string[];
  formTeacherClassName?: string | null;
  onSelectRole: (role: 'Subject Teacher' | 'Form Teacher') => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  availableRoles,
  formTeacherClassName,
  onSelectRole,
  onCancel,
  isLoading = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle backdrop click - stop propagation to prevent issues
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onCancel();
    }
  };

  // Prevent modal content click from closing
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all z-[10000]"
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl px-6 py-8 text-white text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Select Your Role</h2>
            <p className="mt-2 text-primary-100">
              You have multiple roles. Please select which role to use for this session.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {availableRoles.includes('Subject Teacher') && (
              <button
                type="button"
                onClick={() => onSelectRole('Subject Teacher')}
                disabled={isLoading}
                className="w-full p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <GraduationCap className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700">
                      Subject Teacher
                    </h3>
                    <p className="text-sm text-secondary-500">
                      Enter scores for your assigned subjects and classes
                    </p>
                  </div>
                </div>
              </button>
            )}

            {availableRoles.includes('Form Teacher') && (
              <button
                type="button"
                onClick={() => onSelectRole('Form Teacher')}
                disabled={isLoading}
                className="w-full p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <School className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700">
                      Form Teacher
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {formTeacherClassName 
                        ? `Manage ${formTeacherClassName} - attendance, results compilation`
                        : 'Manage your class - attendance, results compilation'
                      }
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full py-2 text-secondary-500 hover:text-secondary-700 text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
