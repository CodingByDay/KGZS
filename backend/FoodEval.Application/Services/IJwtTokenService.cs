using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
