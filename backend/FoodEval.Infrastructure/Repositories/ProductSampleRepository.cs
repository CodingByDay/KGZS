using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class ProductSampleRepository : IProductSampleRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public ProductSampleRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProductSample?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProductSamples.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<ProductSample>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProductSamples.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProductSample>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProductSamples
            .Where(p => p.EvaluationEventId == evaluationEventId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProductSample>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProductSamples
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductSample> CreateAsync(ProductSample productSample, CancellationToken cancellationToken = default)
    {
        _dbContext.ProductSamples.Add(productSample);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return productSample;
    }

    public async Task UpdateAsync(ProductSample productSample, CancellationToken cancellationToken = default)
    {
        _dbContext.ProductSamples.Update(productSample);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.ProductSamples.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<int> GetNextSequentialNumberAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var maxNumber = await _dbContext.ProductSamples
            .Where(p => p.EvaluationEventId == evaluationEventId)
            .Select(p => (int?)p.SequentialNumber)
            .MaxAsync(cancellationToken);

        return (maxNumber ?? 0) + 1;
    }
}
