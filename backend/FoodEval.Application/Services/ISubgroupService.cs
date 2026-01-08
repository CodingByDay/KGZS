using FoodEval.Application.DTOs;

namespace FoodEval.Application.Services;

public interface ISubgroupService
{
    Task<SubgroupDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<SubgroupDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SubgroupDto>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<SubgroupDto> CreateAsync(CreateSubgroupRequest request, CancellationToken cancellationToken = default);
    Task<SubgroupDto> UpdateAsync(Guid id, UpdateSubgroupRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
