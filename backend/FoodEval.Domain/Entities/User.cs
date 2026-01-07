using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public string? PhoneNumber { get; set; }
    public bool PhoneNumberVerified { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    
    // UserType and Organization
    public UserType UserType { get; set; }
    public Guid? OrganizationId { get; set; }
    
    // Navigation properties (not EF Core - domain relationships)
    // User can have multiple roles, but typically one primary role
    public UserRole PrimaryRole { get; set; }
    
    // Validation rules
    public bool IsValidUserTypeRoleCombination()
    {
        return UserType switch
        {
            UserType.GlobalAdmin => PrimaryRole == UserRole.SuperAdmin && OrganizationId == null,
            UserType.OrganizationAdmin => PrimaryRole == UserRole.OrganizationAdmin && OrganizationId != null,
            UserType.OrganizationUser => PrimaryRole != UserRole.SuperAdmin && PrimaryRole != UserRole.OrganizationAdmin && OrganizationId != null,
            UserType.CommissionUser => OrganizationId != null || OrganizationId == null, // Can be global or org-scoped
            UserType.InterestedParty => PrimaryRole == UserRole.InterestedParty,
            _ => false
        };
    }
}
