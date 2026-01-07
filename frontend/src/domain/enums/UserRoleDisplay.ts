import { UserRole } from './UserRole';
import { 
  HiShieldCheck, 
  HiBuildingOffice, 
  HiPencilSquare, 
  HiCalendarDays, 
  HiUserGroup, 
  HiUsers, 
  HiAcademicCap,
  HiBell
} from 'react-icons/hi2';

export interface RoleDisplayInfo {
  label: string;
  labelSl: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const RoleDisplayInfo: Record<UserRole, RoleDisplayInfo> = {
  [UserRole.SuperAdmin]: {
    label: 'System Administrator',
    labelSl: 'Sistemski skrbnik',
    icon: HiShieldCheck,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  [UserRole.OrganizationAdmin]: {
    label: 'Organization Admin',
    labelSl: 'Skrbnik organizacije',
    icon: HiBuildingOffice,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  [UserRole.DataEntry]: {
    label: 'Data Entry',
    labelSl: 'Vnašalec podatkov',
    icon: HiPencilSquare,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  [UserRole.EvaluationOrganizer]: {
    label: 'Evaluation Organizer',
    labelSl: 'Organizator ocenjevanja',
    icon: HiCalendarDays,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  [UserRole.CommissionChair]: {
    label: 'Commission Chair',
    labelSl: 'Predsednik komisije',
    icon: HiUserGroup,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  [UserRole.CommissionMember]: {
    label: 'Commission Member',
    labelSl: 'Član komisije',
    icon: HiUsers,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
  },
  [UserRole.CommissionTrainee]: {
    label: 'Commission Trainee',
    labelSl: 'Vajenec komisije',
    icon: HiAcademicCap,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  [UserRole.InterestedParty]: {
    label: 'Interested Party',
    labelSl: 'Zainteresirana stranka',
    icon: HiBell,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

export function getRoleDisplayInfo(role: UserRole | string, language: 'sl' | 'en' = 'en'): RoleDisplayInfo {
  const roleKey = typeof role === 'string' ? role as UserRole : role;
  return RoleDisplayInfo[roleKey] || RoleDisplayInfo[UserRole.InterestedParty];
}

export function getRoleLabel(role: UserRole | string, language: 'sl' | 'en' = 'en'): string {
  const info = getRoleDisplayInfo(role, language);
  return language === 'sl' ? info.labelSl : info.label;
}
