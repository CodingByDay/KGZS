namespace FoodEval.Application.DTOs;

// DTOs use "Group" terminology for API/UI, but map to internal Category entity
// Groups are independent entities used for categorizing samples (vzorci) for reporting purposes
// They are NOT related to reviewers (ocenjevalci)
public class GroupDto
{
    public Guid Id { get; set; }
    public Guid? EvaluationEventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

