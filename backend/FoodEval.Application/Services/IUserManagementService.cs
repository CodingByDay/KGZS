using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IUserManagementService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserDto>> GetSuperAdminsAsync(CancellationToken cancellationToken = default);
    Task<UserDto> CreateSuperAdminAsync(CreateSuperAdminRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateUserEmailAsync(Guid id, UpdateEmailRequest request, CancellationToken cancellationToken = default);
    Task UpdateUserPasswordAsync(Guid id, UpdatePasswordRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateUserProfileAsync(Guid id, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    
    // Reviewer management
    Task<IEnumerable<ReviewerDto>> GetReviewersAsync(CancellationToken cancellationToken = default);
    Task<ReviewerDto> CreateReviewerAsync(CreateReviewerRequest request, CancellationToken cancellationToken = default);
    Task<ReviewerDto> UpdateReviewerEmailAsync(Guid id, UpdateReviewerEmailRequest request, CancellationToken cancellationToken = default);
    Task<ResetReviewerPasswordResponse> ResetReviewerPasswordAsync(Guid id, ResetReviewerPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ReviewerDto> UpdateReviewerTypeAsync(Guid id, UpdateReviewerTypeRequest request, CancellationToken cancellationToken = default);
}
