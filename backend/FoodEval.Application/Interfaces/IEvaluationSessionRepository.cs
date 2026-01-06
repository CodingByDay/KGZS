using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IEvaluationSessionRepository
{
    Task<EvaluationSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EvaluationSession>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EvaluationSession>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<EvaluationSession?> GetActiveByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<EvaluationSession> CreateAsync(EvaluationSession session, CancellationToken cancellationToken = default);
    Task UpdateAsync(EvaluationSession session, CancellationToken cancellationToken = default);
}
