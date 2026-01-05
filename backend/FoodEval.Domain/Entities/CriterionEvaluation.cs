namespace Domain.Entities;

public class CriterionEvaluation
{
    public Guid Id { get; set; }
    public Guid ExpertEvaluationId { get; set; }
    public Guid EvaluationCriterionId { get; set; }
    public int Score { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ModifiedAt { get; set; }
    
    // Validation: Score values must be within the criterion's MinScore-MaxScore range
    // This is validated against the EvaluationCriterion entity
}
