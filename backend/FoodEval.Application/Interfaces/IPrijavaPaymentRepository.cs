using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Interfaces;

public interface IPrijavaPaymentRepository
{
    Task<PrijavaPayment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PrijavaPayment?> GetLatestByPrijavaIdAsync(Guid prijavaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PrijavaPayment>> GetByPrijavaIdAsync(Guid prijavaId, CancellationToken cancellationToken = default);
    Task<PrijavaPayment> CreateAsync(PrijavaPayment payment, CancellationToken cancellationToken = default);
    Task UpdateAsync(PrijavaPayment payment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
