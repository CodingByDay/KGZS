using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class SubgroupRepository : ISubgroupRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public SubgroupRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Subgroup?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subgroups.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Subgroup>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subgroups
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subgroup>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subgroups
            .Where(s => s.CategoryId == categoryId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Subgroup> CreateAsync(Subgroup subgroup, CancellationToken cancellationToken = default)
    {
        _dbContext.Subgroups.Add(subgroup);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return subgroup;
    }

    public async Task UpdateAsync(Subgroup subgroup, CancellationToken cancellationToken = default)
    {
        _dbContext.Subgroups.Update(subgroup);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Subgroups.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
