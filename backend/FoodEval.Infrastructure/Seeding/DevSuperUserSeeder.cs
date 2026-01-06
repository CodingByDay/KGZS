using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FoodEval.Infrastructure.Seeding;

public class DevSuperUserSeeder
{
    private readonly IUserRepository _userRepository;
    private readonly FoodEvalDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DevSuperUserSeeder> _logger;

    public DevSuperUserSeeder(
        IUserRepository userRepository,
        FoodEvalDbContext dbContext,
        IConfiguration configuration,
        ILogger<DevSuperUserSeeder> logger)
    {
        _userRepository = userRepository;
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var email = _configuration["SEED_SUPERUSER_EMAIL"] ?? "super@local.test";
        var username = _configuration["SEED_SUPERUSER_USERNAME"] ?? "super";
        var password = _configuration["SEED_SUPERUSER_PASSWORD"] ?? "ChangeMe!12345";

        // Check if user already exists (check all users, not just active ones)
        var existingUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (existingUser != null)
        {
            _logger.LogInformation("SuperAdmin user already exists: {Email}", email);
            return;
        }

        // Create new super admin user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            EmailVerified = true,
            FirstName = "Super",
            LastName = "Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            PrimaryRole = UserRole.SuperAdmin,
            UserType = UserType.GlobalAdmin,
            OrganizationId = null, // GlobalAdmin must have null OrganizationId
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _userRepository.CreateAsync(user, cancellationToken);

        _logger.LogWarning(
            "═══════════════════════════════════════════════════════════════\n" +
            "  Seeded SuperAdmin User (Development Only)\n" +
            "  Email: {Email}\n" +
            "  Username: {Username}\n" +
            "  Password: {Password}\n" +
            "═══════════════════════════════════════════════════════════════",
            email, username, password);
    }
}
