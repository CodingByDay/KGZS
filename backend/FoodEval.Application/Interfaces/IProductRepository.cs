using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAndOrganizationIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetByOrganizationIdAndCategoryIdAsync(Guid organizationId, Guid? categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> SearchByOrganizationIdAsync(Guid organizationId, string? searchTerm, Guid? categoryId, Guid? subcategoryId, CancellationToken cancellationToken = default);
    Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
