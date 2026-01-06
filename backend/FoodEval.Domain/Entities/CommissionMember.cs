using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class CommissionMember
{
    public Guid Id { get; set; }
    public Guid CommissionId { get; set; }
    public Guid UserId { get; set; }
    public CommissionMemberRole Role { get; set; }
    public bool IsExcluded { get; set; }
    public DateTimeOffset? ExcludedAt { get; set; }
    public string? ExclusionReason { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Commission members can be excluded during evaluation, but exclusion must be justified
    public void Exclude(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Exclusion reason is required", nameof(reason));
            
        IsExcluded = true;
        ExclusionReason = reason;
        ExcludedAt = DateTimeOffset.UtcNow;
    }
    
    // Validation: A commission member cannot submit multiple expert evaluations for the same evaluation session
    public bool CanSubmitEvaluation() => !IsExcluded;
}
