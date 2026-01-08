namespace FoodEval.Domain.Entities;

public class Subgroup
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; } // References Category (Group)
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Navigation property
    public Category? Category { get; set; }
}
