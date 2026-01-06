using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class ProtocolService : IProtocolService
{
    private readonly IProtocolRepository _protocolRepository;
    private readonly IProductSampleRepository _productSampleRepository;
    private readonly IEvaluationEventService _evaluationEventService;

    public ProtocolService(
        IProtocolRepository protocolRepository,
        IProductSampleRepository productSampleRepository,
        IEvaluationEventService evaluationEventService)
    {
        _protocolRepository = protocolRepository;
        _productSampleRepository = productSampleRepository;
        _evaluationEventService = evaluationEventService;
    }

    public async Task<ProtocolDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _protocolRepository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ProtocolDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _protocolRepository.GetAllAsync(cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ProtocolDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var entities = await _protocolRepository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ProtocolDto>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        var entities = await _protocolRepository.GetByProductSampleIdAsync(productSampleId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<ProtocolDto> GenerateProtocolAsync(GenerateProtocolRequest request, Guid createdBy, CancellationToken cancellationToken = default)
    {
        var productSample = await _productSampleRepository.GetByIdAsync(request.ProductSampleId, cancellationToken);
        if (productSample == null)
            throw new KeyNotFoundException($"ProductSample with id {request.ProductSampleId} not found");

        if (productSample.Status != ProductSampleStatus.Evaluated)
            throw new InvalidOperationException("Protocol can only be generated for evaluated product samples");

        if (productSample.FinalScore == null)
            throw new InvalidOperationException("Product sample must have a calculated score");

        // Calculate score if not already calculated
        await _evaluationEventService.CalculateScoreAsync(request.ProductSampleId, cancellationToken);
        productSample = await _productSampleRepository.GetByIdAsync(request.ProductSampleId, cancellationToken);
        if (productSample == null || productSample.FinalScore == null)
            throw new InvalidOperationException("Failed to calculate score for product sample");

        var protocolNumber = await _protocolRepository.GetNextProtocolNumberAsync(productSample.EvaluationEventId, cancellationToken);

        var protocol = new Protocol
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = productSample.EvaluationEventId,
            ProductSampleId = productSample.Id,
            ApplicantId = productSample.ApplicantId,
            ProtocolNumber = protocolNumber,
            Version = 1,
            FinalScore = productSample.FinalScore.Value,
            Status = ProtocolStatus.Generated,
            GeneratedAt = DateTimeOffset.UtcNow,
            VersionCreatedAt = DateTimeOffset.UtcNow,
            VersionCreatedBy = createdBy,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _protocolRepository.CreateAsync(protocol, cancellationToken);
        return MapToDto(created);
    }

    private static ProtocolDto MapToDto(Protocol entity)
    {
        return new ProtocolDto
        {
            Id = entity.Id,
            EvaluationEventId = entity.EvaluationEventId,
            ProductSampleId = entity.ProductSampleId,
            ApplicantId = entity.ApplicantId,
            ProtocolNumber = entity.ProtocolNumber,
            Version = entity.Version,
            PreviousVersionId = entity.PreviousVersionId,
            FinalScore = entity.FinalScore,
            Status = entity.Status.ToString(),
            GeneratedAt = entity.GeneratedAt,
            SentAt = entity.SentAt,
            AcknowledgedAt = entity.AcknowledgedAt,
            PDFPath = entity.PDFPath,
            VersionCreatedAt = entity.VersionCreatedAt,
            VersionCreatedBy = entity.VersionCreatedBy,
            CreatedAt = entity.CreatedAt
        };
    }
}
