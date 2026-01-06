using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface IOrganizationRepository
{
    Task<Organization?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Organization>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Organization> CreateAsync(Organization organization, CancellationToken cancellationToken = default);
    Task UpdateAsync(Organization organization, CancellationToken cancellationToken = default);
}
