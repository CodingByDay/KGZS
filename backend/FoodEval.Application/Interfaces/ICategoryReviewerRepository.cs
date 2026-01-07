using FoodEval.Domain.Entities;

namespace FoodEval.Application.Interfaces;

public interface ICategoryReviewerRepository
{
    Task<CategoryReviewer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CategoryReviewer>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<CategoryReviewer>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CategoryReviewer> CreateAsync(CategoryReviewer categoryReviewer, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteByCategoryAndUserAsync(Guid categoryId, Guid userId, CancellationToken cancellationToken = default);
}
