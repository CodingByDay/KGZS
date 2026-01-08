using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface ISubgroupRepository
{
    Task<Subgroup?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subgroup>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Subgroup>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Subgroup> CreateAsync(Subgroup subgroup, CancellationToken cancellationToken = default);
    Task UpdateAsync(Subgroup subgroup, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
