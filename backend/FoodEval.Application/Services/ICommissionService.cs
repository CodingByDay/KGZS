using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface ICommissionService
{
    Task<CommissionDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CommissionDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<CommissionDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<CommissionDto> CreateAsync(CreateCommissionRequest request, CancellationToken cancellationToken = default);
    Task<CommissionDto> UpdateAsync(Guid id, UpdateCommissionRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
