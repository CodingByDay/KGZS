using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IProductSampleRepository
{
    Task<ProductSample?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductSample>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductSample>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductSample>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<ProductSample> CreateAsync(ProductSample productSample, CancellationToken cancellationToken = default);
    Task UpdateAsync(ProductSample productSample, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> GetNextSequentialNumberAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
}
