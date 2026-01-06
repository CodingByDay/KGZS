using FoodEval.Domain.Enums;

namespace FoodEval.Application.DTOs.Auth;

public class UserInfoResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
