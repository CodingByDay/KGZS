using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class StructuredCommentTemplate
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Text { get; set; } = string.Empty;
    public StructuredCommentType CommentType { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
