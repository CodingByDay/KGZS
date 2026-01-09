namespace FoodEval.Domain.Entities;

public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MidNumber { get; set; } = string.Empty; // MID number of the village (required, unique)
    public string? Village { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsActive { get; set; } = true; // Soft delete support
}
