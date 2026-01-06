using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class EvaluationSessionRepository : IEvaluationSessionRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public EvaluationSessionRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<EvaluationSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationSessions.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<EvaluationSession>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationSessions
            .Where(s => s.ProductSampleId == productSampleId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EvaluationSession>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationSessions
            .Join(_dbContext.ProductSamples,
                session => session.ProductSampleId,
                sample => sample.Id,
                (session, sample) => new { Session = session, Sample = sample })
            .Where(x => x.Sample.EvaluationEventId == evaluationEventId)
            .Select(x => x.Session)
            .ToListAsync(cancellationToken);
    }

    public async Task<EvaluationSession?> GetActiveByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EvaluationSessions
            .FirstOrDefaultAsync(s => s.ProductSampleId == productSampleId && s.Status == EvaluationSessionStatus.Active, cancellationToken);
    }

    public async Task<EvaluationSession> CreateAsync(EvaluationSession session, CancellationToken cancellationToken = default)
    {
        _dbContext.EvaluationSessions.Add(session);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return session;
    }

    public async Task UpdateAsync(EvaluationSession session, CancellationToken cancellationToken = default)
    {
        _dbContext.EvaluationSessions.Update(session);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
