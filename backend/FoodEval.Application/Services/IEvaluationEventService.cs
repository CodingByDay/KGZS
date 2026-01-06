using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IEvaluationEventService
{
    Task<EvaluationEventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EvaluationEventDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EvaluationEventDto> CreateAsync(CreateEvaluationEventRequest request, Guid createdBy, CancellationToken cancellationToken = default);
    Task<EvaluationEventDto> UpdateAsync(Guid id, UpdateEvaluationEventRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EvaluationSessionDto>> GetEvaluationSessionsAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<EvaluationSessionDto> CreateEvaluationSessionAsync(Guid evaluationEventId, CreateEvaluationSessionRequest request, Guid activatedBy, CancellationToken cancellationToken = default);
    Task<IEnumerable<ScoreDto>> GetScoresAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<ScoreDto> CalculateScoreAsync(Guid productSampleId, CancellationToken cancellationToken = default);
}
