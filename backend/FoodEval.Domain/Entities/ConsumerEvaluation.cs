namespace FoodEval.Domain.Entities;

public class ConsumerEvaluation
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid ConsumerEvaluationStationId { get; set; }
    public decimal Score { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Consumer evaluations are completely separate from expert commission evaluations
    // Validation: Consumer evaluations do not generate records
    // Validation: Each consumer can submit one evaluation per product sample
    // Validation: Consumer evaluations are simple score-based (no criteria)
}
