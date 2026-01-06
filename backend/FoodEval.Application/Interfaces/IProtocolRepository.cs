using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IProtocolRepository
{
    Task<Protocol?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Protocol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Protocol>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Protocol>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default);
    Task<Protocol> CreateAsync(Protocol protocol, CancellationToken cancellationToken = default);
    Task UpdateAsync(Protocol protocol, CancellationToken cancellationToken = default);
    Task<int> GetNextProtocolNumberAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
}
