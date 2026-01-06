using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IExpertEvaluationRepository
{
    Task<ExpertEvaluation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpertEvaluation>> GetByEvaluationSessionIdAsync(Guid evaluationSessionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpertEvaluation>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<ExpertEvaluation> CreateAsync(ExpertEvaluation evaluation, CancellationToken cancellationToken = default);
    Task UpdateAsync(ExpertEvaluation evaluation, CancellationToken cancellationToken = default);
}
