using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class EvaluationEventRepository : IEvaluationEventRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public EvaluationEventRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<EvaluationEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationEvents.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<EvaluationEvent>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationEvents.ToListAsync(cancellationToken);
    }

    public async Task<EvaluationEvent> CreateAsync(EvaluationEvent evaluationEvent, CancellationToken cancellationToken = default)
    {
        _dbContext.EvaluationEvents.Add(evaluationEvent);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return evaluationEvent;
    }

    public async Task UpdateAsync(EvaluationEvent evaluationEvent, CancellationToken cancellationToken = default)
    {
        _dbContext.EvaluationEvents.Update(evaluationEvent);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.EvaluationEvents.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
