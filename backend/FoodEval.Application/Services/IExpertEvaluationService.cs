using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IExpertEvaluationService
{
    Task<ExpertEvaluationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpertEvaluationDto>> GetByEvaluationSessionIdAsync(Guid evaluationSessionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpertEvaluationDto>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<ExpertEvaluationDto> CreateAsync(CreateExpertEvaluationRequest request, Guid createdBy, CancellationToken cancellationToken = default);
    Task<ExpertEvaluationDto> UpdateAsync(Guid id, UpdateExpertEvaluationRequest request, Guid updatedBy, CancellationToken cancellationToken = default);
    Task SubmitAsync(Guid id, Guid submittedBy, CancellationToken cancellationToken = default);
}
