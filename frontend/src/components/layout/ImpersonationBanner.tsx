import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common';
import { LogOut, AlertCircle } from 'lucide-react';

const ImpersonationBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isImpersonating, originalUser, user: currentUser, exitImpersonation } = useAuth();

  if (!isImpersonating || !originalUser || !currentUser) {
    return null;
  }

  const handleExitImpersonation = () => {
    exitImpersonation();
    navigate('/dashboard');
  };

  return (
    <div className="bg-purple-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              Impersonation Mode Active
            </p>
            <p className="text-xs text-purple-100">
              You are logged in as <strong>{currentUser.username}</strong> ({currentUser.role.replace('_', ' ').toUpperCase()})
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitImpersonation}
          className="bg-white text-purple-600 hover:bg-purple-50 border-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
