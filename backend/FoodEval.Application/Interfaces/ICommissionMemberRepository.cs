using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface ICommissionMemberRepository
{
    Task<CommissionMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CommissionMember>> GetByCommissionIdAsync(Guid commissionId, CancellationToken cancellationToken = default);
    Task<CommissionMember> CreateAsync(CommissionMember member, CancellationToken cancellationToken = default);
    Task UpdateAsync(CommissionMember member, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
