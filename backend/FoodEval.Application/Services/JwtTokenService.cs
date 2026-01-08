using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FoodEval.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FoodEval.Application.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
        var issuer = jwtSettings["Issuer"] ?? "FoodEval";
        var audience = jwtSettings["Audience"] ?? "FoodEval";
        var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.PrimaryRole.ToString()),
            new Claim("UserType", user.UserType.ToString()),
        };

        if (user.OrganizationId.HasValue)
        {
            claims.Add(new Claim("OrganizationId", user.OrganizationId.Value.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public int GetAccessTokenExpiryMinutes()
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        return int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");
    }

    public TimeSpan GetRefreshTokenLifetime(bool rememberMe)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        // Longer expiry when remember-me is enabled (default 30 days),
        // shorter expiry otherwise (default 1 day)
        if (rememberMe)
        {
            var days = int.Parse(jwtSettings["RefreshTokenRememberMeDays"] ?? "30");
            return TimeSpan.FromDays(days);
        }

        var shortDays = int.Parse(jwtSettings["RefreshTokenShortDays"] ?? "1");
        return TimeSpan.FromDays(shortDays);
    }
}
