using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface ICategoryService
{
    Task<GroupDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<GroupDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<GroupDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<GroupDto> CreateAsync(CreateGroupRequest request, CancellationToken cancellationToken = default);
    Task<GroupDto> UpdateAsync(Guid id, UpdateGroupRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
