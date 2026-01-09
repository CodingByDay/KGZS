using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Interfaces;

public interface IPrijavaRepository
{
    Task<Prijava?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Prijava?> GetByIdAndOrganizationIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Prijava>> GetByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Prijava>> SearchByOrganizationIdAsync(
        Guid organizationId, 
        PrijavaStatus? status, 
        Guid? itemId, 
        DateTimeOffset? fromDate, 
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default);
    Task<IEnumerable<Prijava>> GetAllAsync(
        Guid? organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default);
    Task<Prijava> CreateAsync(Prijava prijava, CancellationToken cancellationToken = default);
    Task UpdateAsync(Prijava prijava, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
