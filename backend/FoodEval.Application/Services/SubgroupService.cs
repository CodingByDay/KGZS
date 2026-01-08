using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;

namespace FoodEval.Application.Services;

public class SubgroupService : ISubgroupService
{
    private readonly ISubgroupRepository _repository;
    private readonly ICategoryRepository _categoryRepository;

    public SubgroupService(
        ISubgroupRepository repository,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _categoryRepository = categoryRepository;
    }

    public async Task<SubgroupDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;
        
        return await MapToDtoAsync(entity, cancellationToken);
    }

    public async Task<IEnumerable<SubgroupDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        var result = new List<SubgroupDto>();
        
        foreach (var entity in entities)
        {
            result.Add(await MapToDtoAsync(entity, cancellationToken));
        }
        
        return result;
    }

    public async Task<IEnumerable<SubgroupDto>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByCategoryIdAsync(categoryId, cancellationToken);
        var result = new List<SubgroupDto>();
        
        foreach (var entity in entities)
        {
            result.Add(await MapToDtoAsync(entity, cancellationToken));
        }
        
        return result;
    }

    public async Task<SubgroupDto> CreateAsync(CreateSubgroupRequest request, CancellationToken cancellationToken = default)
    {
        // Verify category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
            throw new KeyNotFoundException($"Category (Group) with id {request.CategoryId} not found");

        var entity = new Subgroup
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);
        return await MapToDtoAsync(created, cancellationToken);
    }

    public async Task<SubgroupDto> UpdateAsync(Guid id, UpdateSubgroupRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Subgroup with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;

        await _repository.UpdateAsync(entity, cancellationToken);
        return await MapToDtoAsync(entity, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    private async Task<SubgroupDto> MapToDtoAsync(Subgroup entity, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(entity.CategoryId, cancellationToken);
        
        return new SubgroupDto
        {
            Id = entity.Id,
            CategoryId = entity.CategoryId,
            CategoryName = category?.Name ?? string.Empty,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt
        };
    }
}
