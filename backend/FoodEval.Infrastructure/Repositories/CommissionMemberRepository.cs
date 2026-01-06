using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class CommissionMemberRepository : ICommissionMemberRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public CommissionMemberRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CommissionMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CommissionMembers.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<CommissionMember>> GetByCommissionIdAsync(Guid commissionId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CommissionMembers
            .Where(m => m.CommissionId == commissionId)
            .ToListAsync(cancellationToken);
    }

    public async Task<CommissionMember> CreateAsync(CommissionMember member, CancellationToken cancellationToken = default)
    {
        _dbContext.CommissionMembers.Add(member);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return member;
    }

    public async Task UpdateAsync(CommissionMember member, CancellationToken cancellationToken = default)
    {
        _dbContext.CommissionMembers.Update(member);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var member = await GetByIdAsync(id, cancellationToken);
        if (member != null)
        {
            _dbContext.CommissionMembers.Remove(member);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
