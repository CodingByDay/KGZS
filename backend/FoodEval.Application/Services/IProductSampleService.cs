using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IProductSampleService
{
    Task<ProductSampleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductSampleDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductSampleDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default);
    Task<ProductSampleDto> CreateAsync(CreateProductSampleRequest request, Guid createdBy, CancellationToken cancellationToken = default);
    Task<ProductSampleDto> UpdateAsync(Guid id, UpdateProductSampleRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
