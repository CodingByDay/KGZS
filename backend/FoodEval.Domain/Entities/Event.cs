using Domain.Enums;

namespace Domain.Entities;

public class Event
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public EventStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public bool PaymentRequired { get; set; }
    public bool AllowConsumerEvaluation { get; set; }
    
    // Validation: Event must be in Active status for evaluations to occur
    public bool CanAcceptEvaluations() => Status == EventStatus.Active;
}
