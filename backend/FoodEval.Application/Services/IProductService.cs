using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface IProductService
{
    Task<ProductDto?> GetByIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductDto>> GetByOrganizationIdAsync(Guid organizationId, string? searchTerm, Guid? categoryId, Guid? subcategoryId, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(Guid organizationId, CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(Guid id, Guid organizationId, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
}
