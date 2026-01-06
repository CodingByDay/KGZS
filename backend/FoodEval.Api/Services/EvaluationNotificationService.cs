using FoodEval.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FoodEval.Api.Services;

public interface IEvaluationNotificationService
{
    Task NotifyEvaluationStatusChangedAsync(Guid evaluationEventId, string status);
    Task NotifyEvaluationSessionCreatedAsync(Guid evaluationEventId, Guid sessionId);
    Task NotifyExpertEvaluationSubmittedAsync(Guid evaluationEventId, Guid productSampleId);
    Task NotifyScoreCalculatedAsync(Guid evaluationEventId, Guid productSampleId, decimal? score);
    Task NotifyProtocolGeneratedAsync(Guid evaluationEventId, Guid protocolId);
}

public class EvaluationNotificationService : IEvaluationNotificationService
{
    private readonly IHubContext<EvaluationHub> _hubContext;

    public EvaluationNotificationService(IHubContext<EvaluationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyEvaluationStatusChangedAsync(Guid evaluationEventId, string status)
    {
        await _hubContext.Clients.Group($"evaluation-{evaluationEventId}")
            .SendAsync("EvaluationStatusChanged", new { EvaluationEventId = evaluationEventId, Status = status });
    }

    public async Task NotifyEvaluationSessionCreatedAsync(Guid evaluationEventId, Guid sessionId)
    {
        await _hubContext.Clients.Group($"evaluation-{evaluationEventId}")
            .SendAsync("EvaluationSessionCreated", new { EvaluationEventId = evaluationEventId, SessionId = sessionId });
    }

    public async Task NotifyExpertEvaluationSubmittedAsync(Guid evaluationEventId, Guid productSampleId)
    {
        await _hubContext.Clients.Group($"evaluation-{evaluationEventId}")
            .SendAsync("ExpertEvaluationSubmitted", new { EvaluationEventId = evaluationEventId, ProductSampleId = productSampleId });
    }

    public async Task NotifyScoreCalculatedAsync(Guid evaluationEventId, Guid productSampleId, decimal? score)
    {
        await _hubContext.Clients.Group($"evaluation-{evaluationEventId}")
            .SendAsync("ScoreCalculated", new { EvaluationEventId = evaluationEventId, ProductSampleId = productSampleId, Score = score });
    }

    public async Task NotifyProtocolGeneratedAsync(Guid evaluationEventId, Guid protocolId)
    {
        await _hubContext.Clients.Group($"evaluation-{evaluationEventId}")
            .SendAsync("ProtocolGenerated", new { EvaluationEventId = evaluationEventId, ProtocolId = protocolId });
    }
}
