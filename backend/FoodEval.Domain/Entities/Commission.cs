using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Commission
{
    public Guid Id { get; set; }
    public Guid EvaluationEventId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CommissionStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: A commission must have at least one member (chair)
    // Validation: Only one chair per commission
    // Validation: Each category in an event can have at most one active commission
}
