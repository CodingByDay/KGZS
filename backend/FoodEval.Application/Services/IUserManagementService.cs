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
}
