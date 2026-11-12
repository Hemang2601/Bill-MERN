import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manager, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-xs font-semibold text-[#64748B]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!manager) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
