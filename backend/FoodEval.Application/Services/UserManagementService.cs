using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class UserManagementService : IUserManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganizationRepository _organizationRepository;

    public UserManagementService(
        IUserRepository userRepository,
        IOrganizationRepository organizationRepository)
    {
        _userRepository = userRepository;
        _organizationRepository = organizationRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var organizations = (await _organizationRepository.GetAllAsync(cancellationToken))
            .ToDictionary(o => o.Id);

        return users.Select(u => MapToDto(u, organizations));
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            return null;

        Organization? organization = null;
        if (user.OrganizationId.HasValue)
        {
            organization = await _organizationRepository.GetByIdAsync(user.OrganizationId.Value, cancellationToken);
        }

        return MapToDto(user, organization != null ? new Dictionary<Guid, Organization> { { organization.Id, organization } } : new Dictionary<Guid, Organization>());
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Validate UserType and Role consistency
        ValidateUserTypeRoleCombination(request.UserType, request.PrimaryRole, request.OrganizationId);

        // Validate OrganizationId requirements
        if (request.UserType == UserType.OrganizationAdmin || request.UserType == UserType.OrganizationUser)
        {
            if (!request.OrganizationId.HasValue)
                throw new ArgumentException("OrganizationId is required for OrganizationAdmin and OrganizationUser");
        }

        if (request.UserType == UserType.GlobalAdmin && request.OrganizationId.HasValue)
            throw new ArgumentException("GlobalAdmin must have null OrganizationId");

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
            OrganizationId = request.OrganizationId,
            PrimaryRole = request.PrimaryRole,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _userRepository.CreateAsync(user, cancellationToken);
        return await GetUserByIdAsync(created.Id, cancellationToken) ?? throw new InvalidOperationException("Failed to create user");
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User with id {id} not found");

        // Validate UserType and Role consistency
        ValidateUserTypeRoleCombination(request.UserType, request.PrimaryRole, request.OrganizationId);

        // Validate OrganizationId requirements
        if (request.UserType == UserType.OrganizationAdmin || request.UserType == UserType.OrganizationUser)
        {
            if (!request.OrganizationId.HasValue)
                throw new ArgumentException("OrganizationId is required for OrganizationAdmin and OrganizationUser");
        }

        if (request.UserType == UserType.GlobalAdmin && request.OrganizationId.HasValue)
            throw new ArgumentException("GlobalAdmin must have null OrganizationId");

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.UserType = request.UserType;
        user.OrganizationId = request.OrganizationId;
        user.PrimaryRole = request.PrimaryRole;
        user.IsActive = request.IsActive;

        await _userRepository.UpdateAsync(user, cancellationToken);
        return await GetUserByIdAsync(id, cancellationToken) ?? throw new InvalidOperationException("Failed to update user");
    }

    private static void ValidateUserTypeRoleCombination(UserType userType, UserRole role, Guid? organizationId)
    {
        var isValid = userType switch
        {
            UserType.GlobalAdmin => role == UserRole.SuperAdmin && organizationId == null,
            UserType.OrganizationAdmin => role == UserRole.OrganizationAdmin && organizationId != null,
            UserType.OrganizationUser => role != UserRole.SuperAdmin && role != UserRole.OrganizationAdmin && organizationId != null,
            UserType.CommissionUser => organizationId != null || organizationId == null, // Can be global or org-scoped
            UserType.InterestedParty => role == UserRole.InterestedParty,
            _ => false
        };

        if (!isValid)
            throw new ArgumentException($"Invalid combination of UserType {userType} and Role {role}");
    }

    public async Task<IEnumerable<UserDto>> GetSuperAdminsAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetByRoleAsync(UserRole.SuperAdmin, cancellationToken);
        var organizations = (await _organizationRepository.GetAllAsync(cancellationToken))
            .ToDictionary(o => o.Id);

        return users.Select(u => MapToDto(u, organizations));
    }

    public async Task<UserDto> CreateSuperAdminAsync(CreateSuperAdminRequest request, CancellationToken cancellationToken = default)
    {
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
            UserType = UserType.GlobalAdmin,
            OrganizationId = null, // SuperAdmin must have null OrganizationId
            PrimaryRole = UserRole.SuperAdmin,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _userRepository.CreateAsync(user, cancellationToken);
        return await GetUserByIdAsync(created.Id, cancellationToken) ?? throw new InvalidOperationException("Failed to create SuperAdmin");
    }

    public async Task<UserDto> UpdateUserEmailAsync(Guid id, UpdateEmailRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User with id {id} not found");

        // Check if new email already exists (excluding current user)
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null && existingUser.Id != id)
            throw new InvalidOperationException("User with this email already exists");

        user.Email = request.Email;
        user.EmailVerified = false; // Reset email verification when email is changed

        await _userRepository.UpdateAsync(user, cancellationToken);
        return await GetUserByIdAsync(id, cancellationToken) ?? throw new InvalidOperationException("Failed to update user email");
    }

    public async Task UpdateUserPasswordAsync(Guid id, UpdatePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User with id {id} not found");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task<UserDto> UpdateUserProfileAsync(Guid id, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"User with id {id} not found");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        // ProfilePictureUrl is updated separately via file upload endpoint

        await _userRepository.UpdateAsync(user, cancellationToken);
        return await GetUserByIdAsync(id, cancellationToken) ?? throw new InvalidOperationException("Failed to update user profile");
    }

    public async Task<IEnumerable<ReviewerDto>> GetReviewersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var reviewers = users.Where(u => u.UserType == UserType.CommissionUser);
        
        return reviewers.Select(u => new ReviewerDto
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            PhoneNumber = u.PhoneNumber,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt
        });
    }

    public async Task<ReviewerDto> CreateReviewerAsync(CreateReviewerRequest request, CancellationToken cancellationToken = default)
    {
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
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            UserType = UserType.CommissionUser,
            OrganizationId = null, // Commission users can be global or org-scoped, but for now we'll allow null
            PrimaryRole = UserRole.CommissionMember, // Default role
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _userRepository.CreateAsync(user, cancellationToken);
        
        return new ReviewerDto
        {
            Id = created.Id,
            Email = created.Email,
            FirstName = created.FirstName,
            LastName = created.LastName,
            PhoneNumber = created.PhoneNumber,
            IsActive = created.IsActive,
            CreatedAt = created.CreatedAt,
            LastLoginAt = created.LastLoginAt
        };
    }

    public async Task<ReviewerDto> UpdateReviewerEmailAsync(Guid id, UpdateReviewerEmailRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"Reviewer with id {id} not found");

        if (user.UserType != UserType.CommissionUser)
            throw new InvalidOperationException("User is not a reviewer");

        // Check if new email already exists (excluding current user)
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null && existingUser.Id != id)
            throw new InvalidOperationException("User with this email already exists");

        user.Email = request.Email;
        user.EmailVerified = false; // Reset email verification when email is changed

        await _userRepository.UpdateAsync(user, cancellationToken);
        
        return new ReviewerDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<ReviewerDto> UpdateReviewerProfileAsync(Guid id, UpdateReviewerProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"Reviewer with id {id} not found");

        if (user.UserType != UserType.CommissionUser)
            throw new InvalidOperationException("User is not a reviewer");

        // Check if new email already exists (excluding current user)
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null && existingUser.Id != id)
            throw new InvalidOperationException("User with this email already exists");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.EmailVerified = false; // Reset email verification when email is changed

        await _userRepository.UpdateAsync(user, cancellationToken);
        
        return new ReviewerDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<ResetReviewerPasswordResponse> ResetReviewerPasswordAsync(Guid id, ResetReviewerPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"Reviewer with id {id} not found");

        if (user.UserType != UserType.CommissionUser)
            throw new InvalidOperationException("User is not a reviewer");

        string newPassword;
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            newPassword = request.Password;
        }
        else
        {
            // Generate temporary password
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            newPassword = new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _userRepository.UpdateAsync(user, cancellationToken);

        return new ResetReviewerPasswordResponse
        {
            TemporaryPassword = string.IsNullOrWhiteSpace(request.Password) ? newPassword : null
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
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _userRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task DeleteReviewerAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException($"Reviewer with id {id} not found");

        if (user.UserType != UserType.CommissionUser)
            throw new InvalidOperationException("User is not a reviewer");

        await _userRepository.DeleteAsync(id, cancellationToken);
    }
}
