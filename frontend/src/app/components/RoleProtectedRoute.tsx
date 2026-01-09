import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { UserType } from '@/domain/enums/UserType';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedUserTypes?: UserType[];
  blockedUserTypes?: UserType[];
}

export function RoleProtectedRoute({ 
  children, 
  allowedUserTypes,
  blockedUserTypes 
}: RoleProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user type if restrictions are specified
  if (allowedUserTypes || blockedUserTypes) {
    const userJson = StorageService.getUser();
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const userType = user.userType;
        
        // Convert userType to number for comparison (handles enum, number, or string)
        const userTypeNum = userType !== undefined && userType !== null 
          ? (typeof userType === 'number' ? userType : Number(userType))
          : null;
        
        // Check if user type is blocked (handle enum, number, and string values)
        if (blockedUserTypes) {
          const isBlocked = blockedUserTypes.some(blockedType => {
            const blockedNum = typeof blockedType === 'number' ? blockedType : Number(blockedType);
            return userType === blockedType || 
                   userTypeNum === blockedNum ||
                   userTypeNum === blockedType ||
                   String(userType) === String(blockedType);
          });
          
          if (isBlocked) {
            return <Navigate to="/403" replace />;
          }
        }

        // Check if user type is allowed (handle enum, number, and string values)
        if (allowedUserTypes) {
          const isAllowed = allowedUserTypes.some(allowedType => {
            const allowedNum = typeof allowedType === 'number' ? allowedType : Number(allowedType);
            return userType === allowedType || 
                   userTypeNum === allowedNum ||
                   userTypeNum === allowedType ||
                   String(userType) === String(allowedType);
          });
          
          if (!isAllowed) {
            return <Navigate to="/403" replace />;
          }
        }
      } catch {
        // If parsing fails, allow access (fallback)
      }
    }
  }

  return <>{children}</>;
}
