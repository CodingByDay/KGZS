using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Prijava
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; } // Required
    public Guid ItemId { get; set; } // Required - item/product chosen by org user
    public DateTimeOffset ReviewDueDate { get; set; } // Required
    public PrijavaStatus Status { get; set; } = PrijavaStatus.PendingPayment; // Default on create
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    
    // Navigation properties (for EF Core)
    public Organization? Organization { get; set; }
    public Product? Item { get; set; }
}
