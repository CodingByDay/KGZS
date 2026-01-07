namespace FoodEval.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public Guid? EvaluationEventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<CategoryReviewerDto> Reviewers { get; set; } = new();
}

public class CategoryReviewerDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTimeOffset AssignedAt { get; set; }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<Guid> ReviewerUserIds { get; set; } = new();
}

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
