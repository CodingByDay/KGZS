using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class ExpertEvaluationService : IExpertEvaluationService
{
    private readonly IExpertEvaluationRepository _evaluationRepository;
    private readonly IEvaluationSessionRepository _sessionRepository;
    private readonly ICommissionMemberRepository _commissionMemberRepository;
    private readonly IProductSampleRepository _productSampleRepository;

    public ExpertEvaluationService(
        IExpertEvaluationRepository evaluationRepository,
        IEvaluationSessionRepository sessionRepository,
        ICommissionMemberRepository commissionMemberRepository,
        IProductSampleRepository productSampleRepository)
    {
        _evaluationRepository = evaluationRepository;
        _sessionRepository = sessionRepository;
        _commissionMemberRepository = commissionMemberRepository;
        _productSampleRepository = productSampleRepository;
    }

    public async Task<ExpertEvaluationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _evaluationRepository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ExpertEvaluationDto>> GetByEvaluationSessionIdAsync(Guid evaluationSessionId, CancellationToken cancellationToken = default)
    {
        var entities = await _evaluationRepository.GetByEvaluationSessionIdAsync(evaluationSessionId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ExpertEvaluationDto>> GetByProductSampleIdAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        var entities = await _evaluationRepository.GetByProductSampleIdAsync(productSampleId, cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<ExpertEvaluationDto> CreateAsync(CreateExpertEvaluationRequest request, Guid createdBy, CancellationToken cancellationToken = default)
    {
        // Validate evaluation session is active
        var session = await _sessionRepository.GetByIdAsync(request.EvaluationSessionId, cancellationToken);
        if (session == null)
            throw new KeyNotFoundException($"EvaluationSession with id {request.EvaluationSessionId} not found");

        if (session.Status != EvaluationSessionStatus.Active)
            throw new InvalidOperationException("Can only create evaluations for active sessions");

        // Validate commission member
        var member = await _commissionMemberRepository.GetByIdAsync(request.CommissionMemberId, cancellationToken);
        if (member == null || member.CommissionId != session.CommissionId)
            throw new InvalidOperationException("Commission member not found or does not belong to this commission");

        // Check if evaluation already exists for this member and session
        var existing = (await _evaluationRepository.GetByEvaluationSessionIdAsync(request.EvaluationSessionId, cancellationToken))
            .FirstOrDefault(e => e.CommissionMemberId == request.CommissionMemberId);
        if (existing != null)
            throw new InvalidOperationException("Evaluation already exists for this member and session");

        // Validate exclusion note if excluding
        if (request.IsSampleExcludedByEvaluator && string.IsNullOrWhiteSpace(request.ExclusionNote))
            throw new ArgumentException("Exclusion note is required when excluding a sample");

        var entity = new ExpertEvaluation
        {
            Id = Guid.NewGuid(),
            EvaluationSessionId = request.EvaluationSessionId,
            ProductSampleId = request.ProductSampleId,
            CommissionMemberId = request.CommissionMemberId,
            FinalScore = request.FinalScore,
            IsSampleExcludedByEvaluator = request.IsSampleExcludedByEvaluator,
            ExclusionNote = request.ExclusionNote,
            IsExcludedFromCalculation = member.Role == CommissionMemberRole.Trainee, // Trainees excluded by default
            CreatedAt = DateTimeOffset.UtcNow,
            ModifiedAt = DateTimeOffset.UtcNow
        };

        var created = await _evaluationRepository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<ExpertEvaluationDto> UpdateAsync(Guid id, UpdateExpertEvaluationRequest request, Guid updatedBy, CancellationToken cancellationToken = default)
    {
        var entity = await _evaluationRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"ExpertEvaluation with id {id} not found");

        // Validate session is still active
        var session = await _sessionRepository.GetByIdAsync(entity.EvaluationSessionId, cancellationToken);
        if (session == null || session.Status != EvaluationSessionStatus.Active)
            throw new InvalidOperationException("Can only update evaluations for active sessions");

        if (entity.SubmittedAt.HasValue)
            throw new InvalidOperationException("Cannot update a submitted evaluation");

        // Validate exclusion note if excluding
        if (request.IsSampleExcludedByEvaluator && string.IsNullOrWhiteSpace(request.ExclusionNote))
            throw new ArgumentException("Exclusion note is required when excluding a sample");

        entity.FinalScore = request.FinalScore;
        entity.SetExclusionVote(request.IsSampleExcludedByEvaluator, request.ExclusionNote);
        entity.ModifiedAt = DateTimeOffset.UtcNow;

        await _evaluationRepository.UpdateAsync(entity, cancellationToken);
        return MapToDto(entity);
    }

    public async Task SubmitAsync(Guid id, Guid submittedBy, CancellationToken cancellationToken = default)
    {
        var entity = await _evaluationRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"ExpertEvaluation with id {id} not found");

        if (entity.SubmittedAt.HasValue)
            throw new InvalidOperationException("Evaluation has already been submitted");

        var session = await _sessionRepository.GetByIdAsync(entity.EvaluationSessionId, cancellationToken);
        if (session == null || session.Status != EvaluationSessionStatus.Active)
            throw new InvalidOperationException("Can only submit evaluations for active sessions");

        entity.Submit();
        await _evaluationRepository.UpdateAsync(entity, cancellationToken);

        // Check if sample should be auto-excluded (>50% exclusion votes)
        await CheckAutoExclusionAsync(entity.ProductSampleId, cancellationToken);
    }

    private async Task CheckAutoExclusionAsync(Guid productSampleId, CancellationToken cancellationToken)
    {
        var productSample = await _productSampleRepository.GetByIdAsync(productSampleId, cancellationToken);
        if (productSample == null || productSample.Status != ProductSampleStatus.Submitted)
            return;

        // Get active session
        var sessions = await _sessionRepository.GetByProductSampleIdAsync(productSampleId, cancellationToken);
        var activeSession = sessions.FirstOrDefault(s => s.Status == EvaluationSessionStatus.Active);
        if (activeSession == null)
            return;

        // Get all evaluations for this session
        var evaluations = await _evaluationRepository.GetByEvaluationSessionIdAsync(activeSession.Id, cancellationToken);
        var submittedEvaluations = evaluations.Where(e => e.SubmittedAt.HasValue && !e.IsExcludedFromCalculation).ToList();
        
        if (submittedEvaluations.Count == 0)
            return;

        var exclusionVotes = submittedEvaluations.Count(e => e.IsSampleExcludedByEvaluator);
        var totalVotes = submittedEvaluations.Count;
        
        // If more than 50% vote to exclude, auto-exclude
        if (exclusionVotes > totalVotes / 2.0m)
        {
            var exclusionReasons = submittedEvaluations
                .Where(e => e.IsSampleExcludedByEvaluator && !string.IsNullOrWhiteSpace(e.ExclusionNote))
                .Select(e => e.ExclusionNote!)
                .ToList();
            
            productSample.Exclude(string.Join("; ", exclusionReasons));
            await _productSampleRepository.UpdateAsync(productSample, cancellationToken);
        }
    }

    private static ExpertEvaluationDto MapToDto(ExpertEvaluation entity)
    {
        return new ExpertEvaluationDto
        {
            Id = entity.Id,
            EvaluationSessionId = entity.EvaluationSessionId,
            ProductSampleId = entity.ProductSampleId,
            CommissionMemberId = entity.CommissionMemberId,
            FinalScore = entity.FinalScore,
            IsSampleExcludedByEvaluator = entity.IsSampleExcludedByEvaluator,
            ExclusionNote = entity.ExclusionNote,
            SubmittedAt = entity.SubmittedAt,
            CreatedAt = entity.CreatedAt,
            ModifiedAt = entity.ModifiedAt,
            IsExcludedFromCalculation = entity.IsExcludedFromCalculation
        };
    }
}
