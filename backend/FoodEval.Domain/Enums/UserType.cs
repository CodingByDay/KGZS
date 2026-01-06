namespace FoodEval.Domain.Enums;

public enum UserType
{
    GlobalAdmin = 1,        // SuperAdmin
    OrganizationAdmin = 2,   // Admin of an Organization
    OrganizationUser = 3,   // Normal user inside an Organization
    CommissionUser = 4,     // Commission-related users
    InterestedParty = 5     // Email notification only
}
