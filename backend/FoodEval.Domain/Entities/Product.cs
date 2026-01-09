namespace FoodEval.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; } // Required, scoped to organization
    public Guid CategoryId { get; set; } // Required, reference to Category/Group
    public Guid? SubcategoryId { get; set; } // Optional, reference to Subgroup
    public string Name { get; set; } = string.Empty; // Required
    public string? Description { get; set; } // Optional
    public string? Unit { get; set; } // Optional unit/measure
    public string? ImageUrl { get; set; } // Optional product image
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    
    // Navigation properties (for EF Core)
    public Organization? Organization { get; set; }
    public Category? Category { get; set; }
    public Subgroup? Subcategory { get; set; }
}
