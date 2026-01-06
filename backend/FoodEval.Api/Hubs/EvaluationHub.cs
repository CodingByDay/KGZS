using Microsoft.AspNetCore.SignalR;

namespace FoodEval.Api.Hubs;

public class EvaluationHub : Hub
{
    public async Task JoinEvaluationGroup(string evaluationEventId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"evaluation-{evaluationEventId}");
    }

    public async Task LeaveEvaluationGroup(string evaluationEventId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"evaluation-{evaluationEventId}");
    }
}
