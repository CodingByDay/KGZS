using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class OrganizationService : IOrganizationService
{
    private readonly IOrganizationRepository _organizationRepository;
    private readonly IUserRepository _userRepository;

    public OrganizationService(
        IOrganizationRepository organizationRepository,
        IUserRepository userRepository)
    {
        _organizationRepository = organizationRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<OrganizationDto>> GetAllOrganizationsAsync(CancellationToken cancellationToken = default)
    {
        var organizations = await _organizationRepository.GetAllAsync(cancellationToken);
        return organizations.Select(MapToDto);
    }

    public async Task<RegisterOrganizationResponse> RegisterOrganizationAsync(RegisterOrganizationRequest request, CancellationToken cancellationToken = default)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.AdminEmail, cancellationToken);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists");

        // Create organization
        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            Name = request.OrganizationName,
            Village = request.Village,
            Address = request.Address,
            Email = request.Email,
            Phone = request.Phone,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createdOrganization = await _organizationRepository.CreateAsync(organization, cancellationToken);

        // Create organization admin user
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = request.AdminEmail,
            FirstName = request.AdminFirstName,
            LastName = request.AdminLastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
            UserType = UserType.OrganizationAdmin,
            OrganizationId = createdOrganization.Id,
            PrimaryRole = UserRole.OrganizationAdmin,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createdUser = await _userRepository.CreateAsync(adminUser, cancellationToken);

        return new RegisterOrganizationResponse
        {
            Organization = new OrganizationDto
            {
                Id = createdOrganization.Id,
                Name = createdOrganization.Name,
                Village = createdOrganization.Village,
                Address = createdOrganization.Address,
                Email = createdOrganization.Email,
                Phone = createdOrganization.Phone,
                CreatedAt = createdOrganization.CreatedAt
            },
            AdminUser = new UserDto
            {
                Id = createdUser.Id,
                Email = createdUser.Email,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                UserType = createdUser.UserType,
                OrganizationId = createdUser.OrganizationId,
                OrganizationName = createdOrganization.Name,
                PrimaryRole = createdUser.PrimaryRole,
                IsActive = createdUser.IsActive,
                CreatedAt = createdUser.CreatedAt
            }
        };
    }

    public async Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var organization = await _organizationRepository.GetByIdAsync(id, cancellationToken);
        return organization == null ? null : MapToDto(organization);
    }

    public async Task<OrganizationDto> GetMyOrganizationAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || !user.OrganizationId.HasValue)
            throw new InvalidOperationException("User does not belong to an organization");

        var organization = await _organizationRepository.GetByIdAsync(user.OrganizationId.Value, cancellationToken);
        if (organization == null)
            throw new KeyNotFoundException("Organization not found");

        return MapToDto(organization);
    }

    public async Task<IEnumerable<UserDto>> GetOrganizationUsersAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetByOrganizationIdAsync(organizationId, cancellationToken);
        var organization = await _organizationRepository.GetByIdAsync(organizationId, cancellationToken);
        
        var organizations = organization != null 
            ? new Dictionary<Guid, Organization> { { organization.Id, organization } }
            : new Dictionary<Guid, Organization>();

        return users.Select(u => MapToDto(u, organizations));
    }

    public async Task<UserDto> CreateOrganizationUserAsync(Guid organizationId, CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Validate that organization exists
        var organization = await _organizationRepository.GetByIdAsync(organizationId, cancellationToken);
        if (organization == null)
            throw new KeyNotFoundException("Organization not found");

        // Validate user type - OrganizationAdmin can only create OrganizationUser, CommissionUser, InterestedParty
        if (request.UserType != UserType.OrganizationUser && 
            request.UserType != UserType.CommissionUser && 
            request.UserType != UserType.InterestedParty)
        {
            throw new ArgumentException("OrganizationAdmin can only create OrganizationUser, CommissionUser, or InterestedParty");
        }

        // Validate role - cannot assign SuperAdmin or OrganizationAdmin
        if (request.PrimaryRole == UserRole.SuperAdmin || request.PrimaryRole == UserRole.OrganizationAdmin)
        {
            throw new ArgumentException("Cannot assign SuperAdmin or OrganizationAdmin role");
        }

        // Set organization ID
        request.OrganizationId = organizationId;

        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            UserType = request.UserType,
            OrganizationId = organizationId,
            PrimaryRole = request.PrimaryRole,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _userRepository.CreateAsync(user, cancellationToken);
        
        var organizations = new Dictionary<Guid, Organization> { { organization.Id, organization } };
        return MapToDto(created, organizations);
    }

    private static OrganizationDto MapToDto(Organization organization)
    {
        return new OrganizationDto
        {
            Id = organization.Id,
            Name = organization.Name,
            Village = organization.Village,
            Address = organization.Address,
            Email = organization.Email,
            Phone = organization.Phone,
            CreatedAt = organization.CreatedAt
        };
    }

    private static UserDto MapToDto(User user, Dictionary<Guid, Organization> organizations)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            UserType = user.UserType,
            OrganizationId = user.OrganizationId,
            OrganizationName = user.OrganizationId.HasValue && organizations.ContainsKey(user.OrganizationId.Value)
                ? organizations[user.OrganizationId.Value].Name
                : null,
            PrimaryRole = user.PrimaryRole,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
