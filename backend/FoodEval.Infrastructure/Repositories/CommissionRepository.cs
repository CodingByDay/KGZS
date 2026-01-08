using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class CommissionRepository : ICommissionRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public CommissionRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Commission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Commissions.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Commission>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Commissions.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Commission>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        // Commissions are no longer tied to evaluation events
        // This method is kept for backward compatibility but returns empty list
        return Enumerable.Empty<Commission>();
    }

    public async Task<IEnumerable<Commission>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        // Commissions are no longer tied to categories
        // This method is kept for backward compatibility but returns empty list
        return Enumerable.Empty<Commission>();
    }

    public async Task<Commission> CreateAsync(Commission commission, CancellationToken cancellationToken = default)
    {
        _dbContext.Commissions.Add(commission);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return commission;
    }

    public async Task UpdateAsync(Commission commission, CancellationToken cancellationToken = default)
    {
        _dbContext.Commissions.Update(commission);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Commissions.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
