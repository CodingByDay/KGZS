using Domain.Enums;

namespace Domain.Entities;

public class EvaluationSession
{
    public Guid Id { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid CommissionId { get; set; }
    public Guid ActivatedBy { get; set; }
    public DateTimeOffset ActivatedAt { get; set; }
    public EvaluationSessionStatus Status { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Only one active evaluation session can exist per product sample at a time
    // Validation: An evaluation session must belong to a commission that matches the sample's category
    // Validation: Commission members can submit expert evaluations only during an active session
    public bool IsActive() => Status == EvaluationSessionStatus.Active;
    
    public void Complete()
    {
        if (Status != EvaluationSessionStatus.Active)
            throw new InvalidOperationException("Only active sessions can be completed");
            
        Status = EvaluationSessionStatus.Completed;
        CompletedAt = DateTimeOffset.UtcNow;
    }
    
    public void Cancel()
    {
        if (Status != EvaluationSessionStatus.Active)
            throw new InvalidOperationException("Only active sessions can be cancelled");
            
        Status = EvaluationSessionStatus.Cancelled;
        CompletedAt = DateTimeOffset.UtcNow;
    }
}
