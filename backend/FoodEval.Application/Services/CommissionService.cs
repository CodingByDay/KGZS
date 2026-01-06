using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class CommissionService : ICommissionService
{
    private readonly ICommissionRepository _repository;

    public CommissionService(ICommissionRepository repository)
    {
        _repository = repository;
    }

    public async Task<CommissionDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<CommissionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<CommissionDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<CommissionDto> CreateAsync(CreateCommissionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Commission
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = request.EvaluationEventId,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Status = CommissionStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<CommissionDto> UpdateAsync(Guid id, UpdateCommissionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Commission with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.Status = Enum.Parse<CommissionStatus>(request.Status);

        await _repository.UpdateAsync(entity, cancellationToken);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    private static CommissionDto MapToDto(Commission entity)
    {
        return new CommissionDto
        {
            Id = entity.Id,
            EvaluationEventId = entity.EvaluationEventId,
            CategoryId = entity.CategoryId,
            Name = entity.Name,
            Description = entity.Description,
            Status = entity.Status.ToString(),
            CreatedAt = entity.CreatedAt
        };
    }
}
