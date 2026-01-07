using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly ICategoryReviewerRepository _reviewerRepository;
    private readonly IUserRepository _userRepository;

    public CategoryService(
        ICategoryRepository repository,
        ICategoryReviewerRepository reviewerRepository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _reviewerRepository = reviewerRepository;
        _userRepository = userRepository;
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;
        
        var reviewers = await _reviewerRepository.GetByCategoryIdAsync(id, cancellationToken);
        return await MapToDtoAsync(entity, reviewers, cancellationToken);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        var result = new List<CategoryDto>();
        
        foreach (var entity in entities)
        {
            var reviewers = await _reviewerRepository.GetByCategoryIdAsync(entity.Id, cancellationToken);
            result.Add(await MapToDtoAsync(entity, reviewers, cancellationToken));
        }
        
        return result;
    }

    public async Task<IEnumerable<CategoryDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        var result = new List<CategoryDto>();
        
        foreach (var entity in entities)
        {
            var reviewers = await _reviewerRepository.GetByCategoryIdAsync(entity.Id, cancellationToken);
            result.Add(await MapToDtoAsync(entity, reviewers, cancellationToken));
        }
        
        return result;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Category
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = null,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);
        
        // Create reviewers if provided
        if (request.ReviewerUserIds != null && request.ReviewerUserIds.Any())
        {
            var now = DateTimeOffset.UtcNow;
            foreach (var userId in request.ReviewerUserIds)
            {
                var reviewer = new CategoryReviewer
                {
                    Id = Guid.NewGuid(),
                    CategoryId = created.Id,
                    UserId = userId,
                    AssignedAt = now,
                    CreatedAt = now
                };
                await _reviewerRepository.CreateAsync(reviewer, cancellationToken);
            }
        }
        
        var reviewers = await _reviewerRepository.GetByCategoryIdAsync(created.Id, cancellationToken);
        return await MapToDtoAsync(created, reviewers, cancellationToken);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Category with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;

        await _repository.UpdateAsync(entity, cancellationToken);
        
        // Update reviewers
        var existingReviewers = await _reviewerRepository.GetByCategoryIdAsync(id, cancellationToken);
        var existingUserIds = existingReviewers.Select(r => r.UserId).ToHashSet();
        var requestedUserIds = request.ReviewerUserIds?.ToHashSet() ?? new HashSet<Guid>();
        
        // Remove reviewers that are no longer assigned
        foreach (var reviewer in existingReviewers)
        {
            if (!requestedUserIds.Contains(reviewer.UserId))
            {
                await _reviewerRepository.DeleteAsync(reviewer.Id, cancellationToken);
            }
        }
        
        // Add new reviewers
        if (request.ReviewerUserIds != null)
        {
            var now = DateTimeOffset.UtcNow;
            foreach (var userId in request.ReviewerUserIds)
            {
                if (!existingUserIds.Contains(userId))
                {
                    var reviewer = new CategoryReviewer
                    {
                        Id = Guid.NewGuid(),
                        CategoryId = id,
                        UserId = userId,
                        AssignedAt = now,
                        CreatedAt = now
                    };
                    await _reviewerRepository.CreateAsync(reviewer, cancellationToken);
                }
            }
        }
        
        var reviewers = await _reviewerRepository.GetByCategoryIdAsync(id, cancellationToken);
        return await MapToDtoAsync(entity, reviewers, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    private async Task<CategoryDto> MapToDtoAsync(Category entity, IEnumerable<CategoryReviewer> reviewers, CancellationToken cancellationToken)
    {
        var reviewerDtos = new List<CategoryReviewerDto>();
        
        foreach (var reviewer in reviewers)
        {
            var user = await _userRepository.GetByIdAsync(reviewer.UserId, cancellationToken);
            if (user != null)
            {
                reviewerDtos.Add(new CategoryReviewerDto
                {
                    Id = reviewer.Id,
                    UserId = reviewer.UserId,
                    UserName = $"{user.FirstName} {user.LastName}",
                    UserEmail = user.Email,
                    AssignedAt = reviewer.AssignedAt
                });
            }
        }
        
        return new CategoryDto
        {
            Id = entity.Id,
            EvaluationEventId = entity.EvaluationEventId,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt,
            Reviewers = reviewerDtos
        };
    }
}
