using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IProtocolService
{
    Task<ProtocolDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProtocolDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProtocolDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProtocolDto>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<ProtocolDto> GenerateProtocolAsync(GenerateProtocolRequest request, Guid createdBy, CancellationToken cancellationToken = default);
}
