using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class ScoringPolicyRepository : IScoringPolicyRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public ScoringPolicyRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ScoringPolicy?> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ScoringPolicies
            .FirstOrDefaultAsync(p => p.EvaluationEventId == evaluationEventId, cancellationToken);
    }

    public async Task<ScoringPolicy> CreateAsync(ScoringPolicy policy, CancellationToken cancellationToken = default)
    {
        _dbContext.ScoringPolicies.Add(policy);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return policy;
    }

    public async Task UpdateAsync(ScoringPolicy policy, CancellationToken cancellationToken = default)
    {
        _dbContext.ScoringPolicies.Update(policy);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
