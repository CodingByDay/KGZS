export enum UserType {
  GlobalAdmin = 1,
  OrganizationAdmin = 2,
  OrganizationUser = 3,
  CommissionUser = 4,
  InterestedParty = 5,
}

export const UserTypeLabels: Record<UserType, string> = {
  [UserType.GlobalAdmin]: 'Global Admin',
  [UserType.OrganizationAdmin]: 'Organization Admin',
  [UserType.OrganizationUser]: 'Organization User',
  [UserType.CommissionUser]: 'Commission User',
  [UserType.InterestedParty]: 'Interested Party',
};
