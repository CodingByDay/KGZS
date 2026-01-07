using FoodEval.Domain.Enums;

namespace FoodEval.Application.DTOs.Auth;

public class UserInfoResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; }
    public UserType UserType { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
}
