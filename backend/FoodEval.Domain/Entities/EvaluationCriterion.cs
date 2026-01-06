namespace FoodEval.Domain.Entities;

public class EvaluationCriterion
{
    public Guid Id { get; set; }
    public Guid? CommissionId { get; set; }
    public Guid EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Weight { get; set; }
    public int DisplayOrder { get; set; }
    public int MinScore { get; set; }
    public int MaxScore { get; set; }
    public bool IsRequired { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Score values must be within the criterion's MinScore-MaxScore range
    public bool IsValidScore(int score) => score >= MinScore && score <= MaxScore;
}
