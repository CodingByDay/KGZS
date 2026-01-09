using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ISubgroupRepository _subgroupRepository;
    private readonly IOrganizationRepository _organizationRepository;

    public ProductService(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        ISubgroupRepository subgroupRepository,
        IOrganizationRepository organizationRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _subgroupRepository = subgroupRepository;
        _organizationRepository = organizationRepository;
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (product == null) return null;

        return MapToDto(product);
    }

    public async Task<IEnumerable<ProductDto>> GetByOrganizationIdAsync(Guid organizationId, string? searchTerm, Guid? categoryId, CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.SearchByOrganizationIdAsync(organizationId, searchTerm, categoryId, cancellationToken);
        return products.Select(MapToDto);
    }

    public async Task<ProductDto> CreateAsync(Guid organizationId, CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        // Validate organization exists
        var organization = await _organizationRepository.GetByIdAsync(organizationId, cancellationToken);
        if (organization == null)
            throw new KeyNotFoundException($"Organization with id {organizationId} not found");

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
            throw new KeyNotFoundException($"Category with id {request.CategoryId} not found");

        // Validate subcategory if provided
        if (request.SubcategoryId.HasValue)
        {
            var subcategory = await _subgroupRepository.GetByIdAsync(request.SubcategoryId.Value, cancellationToken);
            if (subcategory == null)
                throw new KeyNotFoundException($"Subcategory with id {request.SubcategoryId.Value} not found");
            if (subcategory.CategoryId != request.CategoryId)
                throw new InvalidOperationException($"Subcategory does not belong to the selected category");
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            CategoryId = request.CategoryId,
            SubcategoryId = request.SubcategoryId,
            Name = request.Name,
            Description = request.Description,
            Unit = request.Unit,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _productRepository.CreateAsync(product, cancellationToken);
        return MapToDto(created);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, Guid organizationId, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {id} not found or does not belong to organization {organizationId}");

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
            throw new KeyNotFoundException($"Category with id {request.CategoryId} not found");

        // Validate subcategory if provided
        if (request.SubcategoryId.HasValue)
        {
            var subcategory = await _subgroupRepository.GetByIdAsync(request.SubcategoryId.Value, cancellationToken);
            if (subcategory == null)
                throw new KeyNotFoundException($"Subcategory with id {request.SubcategoryId.Value} not found");
            if (subcategory.CategoryId != request.CategoryId)
                throw new InvalidOperationException($"Subcategory does not belong to the selected category");
        }

        product.Name = request.Name;
        product.CategoryId = request.CategoryId;
        product.SubcategoryId = request.SubcategoryId;
        product.Description = request.Description;
        product.Unit = request.Unit;
        product.ImageUrl = request.ImageUrl;
        product.UpdatedAt = DateTimeOffset.UtcNow;

        await _productRepository.UpdateAsync(product, cancellationToken);
        return MapToDto(product);
    }

    public async Task DeleteAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {id} not found or does not belong to organization {organizationId}");

        await _productRepository.DeleteAsync(id, cancellationToken);
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            OrganizationId = product.OrganizationId,
            OrganizationName = product.Organization?.Name ?? string.Empty,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            SubcategoryId = product.SubcategoryId,
            SubcategoryName = product.Subcategory?.Name ?? null,
            Name = product.Name,
            Description = product.Description,
            Unit = product.Unit,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
