using FoodEval.Domain.Enums;

namespace FoodEval.Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserType UserType { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public UserRole PrimaryRole { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
}

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserType UserType { get; set; }
    public Guid? OrganizationId { get; set; }
    public UserRole PrimaryRole { get; set; }
}

public class UpdateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserType UserType { get; set; }
    public Guid? OrganizationId { get; set; }
    public UserRole PrimaryRole { get; set; }
    public bool IsActive { get; set; }
}

public class OrganizationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MidNumber { get; set; } = string.Empty;
    public string? Village { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public int MemberCount { get; set; } // Number of members in the organization
}

public class CreateOrganizationRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50)]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[A-Za-z0-9\-]+$", ErrorMessage = "MID number can only contain letters, numbers, and hyphens")]
    public string MidNumber { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Village { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string? Address { get; set; }

    [System.ComponentModel.DataAnnotations.EmailAddress]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Email { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(20)]
    public string? Phone { get; set; }
}

public class UpdateOrganizationRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50)]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[A-Za-z0-9\-]+$", ErrorMessage = "MID number can only contain letters, numbers, and hyphens")]
    public string MidNumber { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Village { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string? Address { get; set; }

    [System.ComponentModel.DataAnnotations.EmailAddress]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Email { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(20)]
    public string? Phone { get; set; }
}

public class RegisterOrganizationRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string OrganizationName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50)]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[A-Za-z0-9\-]+$", ErrorMessage = "MID number can only contain letters, numbers, and hyphens")]
    public string MidNumber { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Village { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string? Address { get; set; }

    [System.ComponentModel.DataAnnotations.EmailAddress]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? Email { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(20)]
    public string? Phone { get; set; }

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string AdminEmail { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.MinLength(6)]
    public string AdminPassword { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50)]
    public string AdminFirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(50)]
    public string AdminLastName { get; set; } = string.Empty;
}

public class RegisterOrganizationResponse
{
    public OrganizationDto Organization { get; set; } = null!;
    public UserDto AdminUser { get; set; } = null!;
}

public class CreateSuperAdminRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string LastName { get; set; } = string.Empty;
}

public class UpdateEmailRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class UpdatePasswordRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? PreferredLanguage { get; set; }
}

public class ReviewerDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
}

public class CreateReviewerRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}

public class UpdateReviewerEmailRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetReviewerPasswordRequest
{
    [System.ComponentModel.DataAnnotations.MinLength(6)]
    public string? Password { get; set; }
}

public class ResetReviewerPasswordResponse
{
    public string? TemporaryPassword { get; set; }
}

public class UpdateReviewerProfileRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string LastName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}
