using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class PrijavaPaymentRepository : IPrijavaPaymentRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public PrijavaPaymentRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PrijavaPayment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.PrijavaPayments
            .Include(pp => pp.Prijava)
            .Include(pp => pp.AdminConfirmedByUser)
            .FirstOrDefaultAsync(pp => pp.Id == id, cancellationToken);
    }

    public async Task<PrijavaPayment?> GetLatestByPrijavaIdAsync(Guid prijavaId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.PrijavaPayments
            .Include(pp => pp.Prijava)
            .Include(pp => pp.AdminConfirmedByUser)
            .Where(pp => pp.PrijavaId == prijavaId)
            .OrderByDescending(pp => pp.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<PrijavaPayment>> GetByPrijavaIdAsync(Guid prijavaId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.PrijavaPayments
            .Include(pp => pp.Prijava)
            .Include(pp => pp.AdminConfirmedByUser)
            .Where(pp => pp.PrijavaId == prijavaId)
            .OrderByDescending(pp => pp.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<PrijavaPayment> CreateAsync(PrijavaPayment payment, CancellationToken cancellationToken = default)
    {
        _dbContext.PrijavaPayments.Add(payment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return payment;
    }

    public async Task UpdateAsync(PrijavaPayment payment, CancellationToken cancellationToken = default)
    {
        _dbContext.PrijavaPayments.Update(payment);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.PrijavaPayments.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
