using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class ProtocolRepository : IProtocolRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public ProtocolRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Protocol?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Protocols.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Protocol>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Protocols.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Protocol>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Protocols
            .Where(p => p.EvaluationEventId == evaluationEventId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Protocol>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Protocols
            .Where(p => p.ProductSampleId == productSampleId)
            .OrderByDescending(p => p.Version)
            .ToListAsync(cancellationToken);
    }

    public async Task<Protocol> CreateAsync(Protocol protocol, CancellationToken cancellationToken = default)
    {
        _dbContext.Protocols.Add(protocol);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return protocol;
    }

    public async Task UpdateAsync(Protocol protocol, CancellationToken cancellationToken = default)
    {
        _dbContext.Protocols.Update(protocol);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> GetNextProtocolNumberAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var maxNumber = await _dbContext.Protocols
            .Where(p => p.EvaluationEventId == evaluationEventId)
            .Select(p => (int?)p.ProtocolNumber)
            .MaxAsync(cancellationToken);

        return (maxNumber ?? 0) + 1;
    }
}
