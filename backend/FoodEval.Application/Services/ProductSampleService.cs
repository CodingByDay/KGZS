using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class ProductSampleService : IProductSampleService
{
    private readonly IProductSampleRepository _repository;

    public ProductSampleService(IProductSampleRepository repository)
    {
        _repository = repository;
    }

    public async Task<ProductSampleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ProductSampleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductSampleDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<ProductSampleDto> CreateAsync(CreateProductSampleRequest request, Guid createdBy, CancellationToken cancellationToken = default)
    {
        var sequentialNumber = await _repository.GetNextSequentialNumberAsync(request.EvaluationEventId, cancellationToken);
        var qrCode = Guid.NewGuid().ToString("N")[..16].ToUpper();

        var entity = new ProductSample
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = request.EvaluationEventId,
            ApplicantId = request.ApplicantId,
            CategoryId = request.CategoryId,
            SequentialNumber = sequentialNumber,
            Name = request.Name,
            Description = request.Description,
            QRCode = qrCode,
            EvaluationMode = Enum.Parse<EvaluationMode>(request.EvaluationMode),
            Status = ProductSampleStatus.Draft,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<ProductSampleDto> UpdateAsync(Guid id, UpdateProductSampleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"ProductSample with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.CategoryId = request.CategoryId;

        await _repository.UpdateAsync(entity, cancellationToken);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }

    private static ProductSampleDto MapToDto(ProductSample entity)
    {
        return new ProductSampleDto
        {
            Id = entity.Id,
            EvaluationEventId = entity.EvaluationEventId,
            ApplicantId = entity.ApplicantId,
            CategoryId = entity.CategoryId,
            SequentialNumber = entity.SequentialNumber,
            Name = entity.Name,
            Description = entity.Description,
            QRCode = entity.QRCode,
            LabelData = entity.LabelData,
            EvaluationMode = entity.EvaluationMode.ToString(),
            Status = entity.Status.ToString(),
            ExcludedAt = entity.ExcludedAt,
            ExclusionReason = entity.ExclusionReason,
            FinalScore = entity.FinalScore,
            CreatedAt = entity.CreatedAt,
            SubmittedAt = entity.SubmittedAt,
            EvaluatedAt = entity.EvaluatedAt
        };
    }
}
