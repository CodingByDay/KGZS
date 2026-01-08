using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Commission
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CommissionStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Navigation property for members
    public ICollection<CommissionMember> Members { get; set; } = new List<CommissionMember>();
    
    // Validation: A commission must have at least one Main Member
    // Validation: Exactly one Main Member per commission
    // Validation: President is optional (0 or 1)
    // Validation: Commissions are NOT tied to categories/groups or evaluation events
}
