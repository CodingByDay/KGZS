import { UserRole } from '../enums/UserRole';
import { UserType } from '../enums/UserType';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  userType: UserType;
  organizationId?: string;
  organizationName?: string;
}
