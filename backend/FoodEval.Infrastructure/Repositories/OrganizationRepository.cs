using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public OrganizationRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Organization?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Organizations.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Organization>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Organizations.ToListAsync(cancellationToken);
    }

    public async Task<Organization> CreateAsync(Organization organization, CancellationToken cancellationToken = default)
    {
        _dbContext.Organizations.Add(organization);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return organization;
    }

    public async Task UpdateAsync(Organization organization, CancellationToken cancellationToken = default)
    {
        _dbContext.Organizations.Update(organization);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
