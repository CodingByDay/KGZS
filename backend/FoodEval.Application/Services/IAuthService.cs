using FoodEval.Application.DTOs.Auth;
using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
