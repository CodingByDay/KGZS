using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface ICommissionRepository
{
    Task<Commission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Commission>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Commission>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Commission>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Commission> CreateAsync(Commission commission, CancellationToken cancellationToken = default);
    Task UpdateAsync(Commission commission, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
