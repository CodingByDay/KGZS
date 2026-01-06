using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<CategoryDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Category
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = request.EvaluationEventId,
            Name = request.Name,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Category with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.DisplayOrder = request.DisplayOrder;

        await _repository.UpdateAsync(entity, cancellationToken);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    private static CategoryDto MapToDto(Category entity)
    {
        return new CategoryDto
        {
            Id = entity.Id,
            EvaluationEventId = entity.EvaluationEventId,
            Name = entity.Name,
            Description = entity.Description,
            DisplayOrder = entity.DisplayOrder,
            CreatedAt = entity.CreatedAt
        };
    }
}
