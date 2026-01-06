using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IEvaluationEventRepository
{
    Task<EvaluationEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EvaluationEvent>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EvaluationEvent> CreateAsync(EvaluationEvent evaluationEvent, CancellationToken cancellationToken = default);
    Task UpdateAsync(EvaluationEvent evaluationEvent, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
