namespace FoodEval.Domain.Entities;

public class CategoryReviewer
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: A user can be assigned to multiple categories
    // Validation: A category can have multiple reviewers
}
