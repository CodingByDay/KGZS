namespace FoodEval.Application.DTOs;

public class SubgroupDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateSubgroupRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateSubgroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
