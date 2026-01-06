using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IScoringPolicyRepository
{
    Task<ScoringPolicy?> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<ScoringPolicy> CreateAsync(ScoringPolicy policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(ScoringPolicy policy, CancellationToken cancellationToken = default);
}
