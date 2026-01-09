using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class PrijavaRepository : IPrijavaRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public PrijavaRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Prijava?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Prijave
            .Include(p => p.Organization)
            .Include(p => p.Item)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Prijava?> GetByIdAndOrganizationIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Prijave
            .Include(p => p.Organization)
            .Include(p => p.Item)
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId, cancellationToken);
    }

    public async Task<IEnumerable<Prijava>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Prijave
            .Include(p => p.Organization)
            .Include(p => p.Item)
            .Where(p => p.OrganizationId == organizationId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Prijava>> SearchByOrganizationIdAsync(
        Guid organizationId, 
        PrijavaStatus? status, 
        Guid? itemId, 
        DateTimeOffset? fromDate, 
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Prijave
            .Include(p => p.Organization)
            .Include(p => p.Item)
            .Where(p => p.OrganizationId == organizationId);

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (itemId.HasValue)
        {
            query = query.Where(p => p.ItemId == itemId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= toDate.Value);
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Prijava>> GetAllAsync(
        Guid? organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Prijave
            .Include(p => p.Organization)
            .Include(p => p.Item)
            .AsQueryable();

        if (organizationId.HasValue)
        {
            query = query.Where(p => p.OrganizationId == organizationId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (itemId.HasValue)
        {
            query = query.Where(p => p.ItemId == itemId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= toDate.Value);
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Prijava> CreateAsync(Prijava prijava, CancellationToken cancellationToken = default)
    {
        _dbContext.Prijave.Add(prijava);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return prijava;
    }

    public async Task UpdateAsync(Prijava prijava, CancellationToken cancellationToken = default)
    {
        _dbContext.Prijave.Update(prijava);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Prijave.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
