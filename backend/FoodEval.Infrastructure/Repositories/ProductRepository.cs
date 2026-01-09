using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public ProductRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Include(p => p.Organization)
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Product?> GetByIdAndOrganizationIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Include(p => p.Organization)
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Include(p => p.Organization)
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Where(p => p.OrganizationId == organizationId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByOrganizationIdAndCategoryIdAsync(Guid organizationId, Guid? categoryId, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products
            .Include(p => p.Organization)
            .Include(p => p.Category)
            .Where(p => p.OrganizationId == organizationId);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        return await query
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> SearchByOrganizationIdAsync(Guid organizationId, string? searchTerm, Guid? categoryId, Guid? subcategoryId, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products
            .Include(p => p.Organization)
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Where(p => p.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchLower = searchTerm.ToLower();
            query = query.Where(p => 
                p.Name.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower)));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (subcategoryId.HasValue)
        {
            query = query.Where(p => p.SubcategoryId == subcategoryId.Value);
        }

        return await query
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _dbContext.Products.Update(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Products.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
