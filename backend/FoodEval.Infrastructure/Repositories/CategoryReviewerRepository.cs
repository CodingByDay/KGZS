using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Repositories;

public class CategoryReviewerRepository : ICategoryReviewerRepository
{
    private readonly FoodEvalDbContext _dbContext;

    public CategoryReviewerRepository(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CategoryReviewer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CategoryReviewers.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<CategoryReviewer>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CategoryReviewers
            .Where(cr => cr.CategoryId == categoryId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<CategoryReviewer>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.CategoryReviewers
            .Where(cr => cr.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryReviewer> CreateAsync(CategoryReviewer categoryReviewer, CancellationToken cancellationToken = default)
    {
        _dbContext.CategoryReviewers.Add(categoryReviewer);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return categoryReviewer;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _dbContext.CategoryReviewers.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteByCategoryAndUserAsync(Guid categoryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.CategoryReviewers
            .FirstOrDefaultAsync(cr => cr.CategoryId == categoryId && cr.UserId == userId, cancellationToken);
        if (entity != null)
        {
            _dbContext.CategoryReviewers.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
