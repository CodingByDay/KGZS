using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class EvaluationEventService : IEvaluationEventService
{
    private readonly IEvaluationEventRepository _eventRepository;
    private readonly IEvaluationSessionRepository _sessionRepository;
    private readonly IExpertEvaluationRepository _expertEvaluationRepository;
    private readonly IProductSampleRepository _productSampleRepository;
    private readonly IScoringPolicyRepository _scoringPolicyRepository;
    private readonly ICommissionMemberRepository _commissionMemberRepository;

    public EvaluationEventService(
        IEvaluationEventRepository eventRepository,
        IEvaluationSessionRepository sessionRepository,
        IExpertEvaluationRepository expertEvaluationRepository,
        IProductSampleRepository productSampleRepository,
        IScoringPolicyRepository scoringPolicyRepository,
        ICommissionMemberRepository commissionMemberRepository)
    {
        _eventRepository = eventRepository;
        _sessionRepository = sessionRepository;
        _expertEvaluationRepository = expertEvaluationRepository;
        _productSampleRepository = productSampleRepository;
        _scoringPolicyRepository = scoringPolicyRepository;
        _commissionMemberRepository = commissionMemberRepository;
    }

    public async Task<EvaluationEventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _eventRepository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<EvaluationEventDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _eventRepository.GetAllAsync(cancellationToken);
        return entities.Select(MapToDto);
    }

    public async Task<EvaluationEventDto> CreateAsync(CreateEvaluationEventRequest request, Guid createdBy, CancellationToken cancellationToken = default)
    {
        var entity = new EvaluationEvent
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = EventStatus.Draft,
            CreatedBy = createdBy,
            PaymentRequired = request.PaymentRequired,
            AllowConsumerEvaluation = request.AllowConsumerEvaluation,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _eventRepository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<EvaluationEventDto> UpdateAsync(Guid id, UpdateEvaluationEventRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _eventRepository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"EvaluationEvent with id {id} not found");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.Status = Enum.Parse<EventStatus>(request.Status);
        entity.PaymentRequired = request.PaymentRequired;
        entity.AllowConsumerEvaluation = request.AllowConsumerEvaluation;

        await _eventRepository.UpdateAsync(entity, cancellationToken);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _eventRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<IEnumerable<EvaluationSessionDto>> GetEvaluationSessionsAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var sessions = await _sessionRepository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        return sessions.Select(MapToDto);
    }

    public async Task<EvaluationSessionDto> CreateEvaluationSessionAsync(Guid evaluationEventId, CreateEvaluationSessionRequest request, Guid activatedBy, CancellationToken cancellationToken = default)
    {
        var productSample = await _productSampleRepository.GetByIdAsync(request.ProductSampleId, cancellationToken);
        if (productSample == null || productSample.EvaluationEventId != evaluationEventId)
            throw new InvalidOperationException("ProductSample not found or does not belong to this event");

        var activeSession = await _sessionRepository.GetActiveByProductSampleIdAsync(request.ProductSampleId, cancellationToken);
        if (activeSession != null)
            throw new InvalidOperationException("An active evaluation session already exists for this product sample");

        // Validate that the user can start the evaluation
        // User must be either President OR MainMember (if President is not present)
        // Get all commission members for this commission
        var commissionMembers = await _commissionMemberRepository.GetByCommissionIdAsync(request.CommissionId, cancellationToken);
        var userMember = commissionMembers.FirstOrDefault(m => m.UserId == activatedBy);
        
        if (userMember == null)
            throw new InvalidOperationException("User is not a member of this commission");

        // Check if there's a President
        var president = commissionMembers.FirstOrDefault(m => m.Role == CommissionMemberRole.President);
        
        // Validation: If President exists, only President can start. If no President, MainMember can start.
        if (president != null)
        {
            // President is present - only President can start
            if (userMember.Role != CommissionMemberRole.President)
                throw new InvalidOperationException("Only the President can start evaluation when President is assigned to the commission");
        }
        else
        {
            // No President - MainMember can start
            if (userMember.Role != CommissionMemberRole.MainMember)
                throw new InvalidOperationException("Only the Main Member can start evaluation when President is not assigned to the commission");
        }

        var session = new EvaluationSession
        {
            Id = Guid.NewGuid(),
            ProductSampleId = request.ProductSampleId,
            CommissionId = request.CommissionId,
            ActivatedBy = activatedBy,
            ActivatedAt = DateTimeOffset.UtcNow,
            Status = EvaluationSessionStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _sessionRepository.CreateAsync(session, cancellationToken);
        return MapToDto(created);
    }

    public async Task<IEnumerable<ScoreDto>> GetScoresAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        var productSamples = await _productSampleRepository.GetByEvaluationEventIdAsync(evaluationEventId, cancellationToken);
        var scores = new List<ScoreDto>();

        foreach (var sample in productSamples)
        {
            var score = await CalculateScoreAsync(sample.Id, cancellationToken);
            scores.Add(score);
        }

        return scores;
    }

    public async Task<ScoreDto> CalculateScoreAsync(Guid productSampleId, CancellationToken cancellationToken = default)
    {
        var productSample = await _productSampleRepository.GetByIdAsync(productSampleId, cancellationToken);
        if (productSample == null)
            throw new KeyNotFoundException($"ProductSample with id {productSampleId} not found");

        var scoringPolicy = await _scoringPolicyRepository.GetByEvaluationEventIdAsync(productSample.EvaluationEventId, cancellationToken);
        if (scoringPolicy == null)
        {
            // Create default scoring policy
            scoringPolicy = new ScoringPolicy
            {
                Id = Guid.NewGuid(),
                EvaluationEventId = productSample.EvaluationEventId,
                TrimHighLowFromCount = 5,
                TrimCountHigh = 1,
                TrimCountLow = 1,
                RoundingDecimals = 2,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow
            };
            await _scoringPolicyRepository.CreateAsync(scoringPolicy, cancellationToken);
        }

        // Get the most recent completed evaluation session
        var sessions = await _sessionRepository.GetByProductSampleIdAsync(productSampleId, cancellationToken);
        var completedSession = sessions
            .Where(s => s.Status == EvaluationSessionStatus.Completed)
            .OrderByDescending(s => s.CompletedAt)
            .FirstOrDefault();

        if (completedSession == null)
        {
            return new ScoreDto
            {
                ProductSampleId = productSampleId,
                FinalScore = null,
                EvaluationCount = 0,
                CalculatedAt = null
            };
        }

        var evaluations = await _expertEvaluationRepository.GetByEvaluationSessionIdAsync(completedSession.Id, cancellationToken);
        var validEvaluations = evaluations
            .Where(e => !e.IsExcludedFromCalculation && e.FinalScore.HasValue)
            .Select(e => e.FinalScore!.Value)
            .ToList();

        if (validEvaluations.Count == 0)
        {
            return new ScoreDto
            {
                ProductSampleId = productSampleId,
                FinalScore = null,
                EvaluationCount = 0,
                CalculatedAt = null
            };
        }

        decimal finalScore;
        if (validEvaluations.Count < scoringPolicy.TrimHighLowFromCount)
        {
            // Average of all
            finalScore = validEvaluations.Average();
        }
        else
        {
            // Exclude highest and lowest
            var sorted = validEvaluations.OrderBy(x => x).ToList();
            var trimmed = sorted.Skip(scoringPolicy.TrimCountLow).Take(sorted.Count - scoringPolicy.TrimCountHigh - scoringPolicy.TrimCountLow).ToList();
            finalScore = trimmed.Average();
        }

        finalScore = Math.Round(finalScore, scoringPolicy.RoundingDecimals, MidpointRounding.AwayFromZero);

        // Update product sample
        productSample.FinalScore = finalScore;
        productSample.EvaluatedAt = DateTimeOffset.UtcNow;
        if (productSample.Status == ProductSampleStatus.Submitted)
        {
            productSample.Status = ProductSampleStatus.Evaluated;
        }
        await _productSampleRepository.UpdateAsync(productSample, cancellationToken);

        return new ScoreDto
        {
            ProductSampleId = productSampleId,
            FinalScore = finalScore,
            EvaluationCount = validEvaluations.Count,
            CalculatedAt = DateTimeOffset.UtcNow
        };
    }

    private static EvaluationEventDto MapToDto(EvaluationEvent entity)
    {
        return new EvaluationEventDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Status = entity.Status.ToString(),
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            PaymentRequired = entity.PaymentRequired,
            AllowConsumerEvaluation = entity.AllowConsumerEvaluation
        };
    }

    private static EvaluationSessionDto MapToDto(EvaluationSession entity)
    {
        return new EvaluationSessionDto
        {
            Id = entity.Id,
            ProductSampleId = entity.ProductSampleId,
            CommissionId = entity.CommissionId,
            ActivatedBy = entity.ActivatedBy,
            ActivatedAt = entity.ActivatedAt,
            Status = entity.Status.ToString(),
            CompletedAt = entity.CompletedAt,
            CreatedAt = entity.CreatedAt
        };
    }
}
