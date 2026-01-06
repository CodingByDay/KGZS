namespace FoodEval.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public Guid EvaluationEventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
