using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class ExpertEvaluationRepository : IExpertEvaluationRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public ExpertEvaluationRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ExpertEvaluation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ExpertEvaluations.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<ExpertEvaluation>> GetByEvaluationSessionIdAsync(Guid evaluationSessionId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ExpertEvaluations
            .Where(e => e.EvaluationSessionId == evaluationSessionId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ExpertEvaluation>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ExpertEvaluations
            .Where(e => e.ProductSampleId == productSampleId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ExpertEvaluation> CreateAsync(ExpertEvaluation evaluation, CancellationToken cancellationToken = default)
    {
        _dbContext.ExpertEvaluations.Add(evaluation);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return evaluation;
    }

    public async Task UpdateAsync(ExpertEvaluation evaluation, CancellationToken cancellationToken = default)
    {
        _dbContext.ExpertEvaluations.Update(evaluation);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
