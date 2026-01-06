namespace FoodEval.Domain.Entities;

public class ExpertEvaluation
{
    public Guid Id { get; set; }
    public Guid EvaluationSessionId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid CommissionMemberId { get; set; }
    public decimal? FinalScore { get; set; }
    public bool IsSampleExcludedByEvaluator { get; set; }
    public string? ExclusionNote { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ModifiedAt { get; set; }
    public bool IsExcludedFromCalculation { get; set; }
    
    // Validation: If IsSampleExcludedByEvaluator is true, ExclusionNote is required
    public void SetExclusionVote(bool exclude, string? note)
    {
        if (exclude && string.IsNullOrWhiteSpace(note))
            throw new ArgumentException("Exclusion note is required when excluding a sample", nameof(note));
            
        IsSampleExcludedByEvaluator = exclude;
        ExclusionNote = exclude ? note : null;
        ModifiedAt = DateTimeOffset.UtcNow;
    }
    
    // Validation: For FinalScore mode: evaluation must have a FinalScore value
    // Validation: For CriteriaBased mode: evaluation must have at least one CriterionEvaluation
    // Validation: All required criteria must be evaluated in CriteriaBased mode
    // Validation: An expert evaluation cannot be modified after the evaluation session is completed
    public bool CanBeModified(bool sessionIsActive) => sessionIsActive;
    
    public void Submit()
    {
        if (SubmittedAt.HasValue)
            throw new InvalidOperationException("Evaluation has already been submitted");
            
        SubmittedAt = DateTimeOffset.UtcNow;
        ModifiedAt = DateTimeOffset.UtcNow;
    }
}
