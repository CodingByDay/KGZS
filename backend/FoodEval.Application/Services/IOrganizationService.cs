using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IOrganizationService
{
    Task<IEnumerable<OrganizationDto>> GetAllOrganizationsAsync(CancellationToken cancellationToken = default);
    Task<OrganizationDto?> GetOrganizationByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrganizationDto> CreateOrganizationAsync(CreateOrganizationRequest request, CancellationToken cancellationToken = default);
    Task<OrganizationDto> UpdateOrganizationAsync(Guid id, UpdateOrganizationRequest request, CancellationToken cancellationToken = default);
    Task DeleteOrganizationAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RegisterOrganizationResponse> RegisterOrganizationAsync(RegisterOrganizationRequest request, CancellationToken cancellationToken = default);
    Task<OrganizationDto> GetMyOrganizationAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserDto>> GetOrganizationUsersAsync(Guid organizationId, CancellationToken cancellationToken = default);
    Task<UserDto> CreateOrganizationUserAsync(Guid organizationId, CreateUserRequest request, CancellationToken cancellationToken = default);
    Task RemoveOrganizationMemberAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken = default);
}
