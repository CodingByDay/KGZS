using Domain.Enums;

namespace Domain.Entities;

public class Comment
{
    public Guid Id { get; set; }
    public Guid ExpertEvaluationId { get; set; }
    public Guid? CommissionMemberId { get; set; }
    public CommentType CommentType { get; set; }
    public Guid? StructuredCommentId { get; set; }
    public string? FreeText { get; set; }
    public CommentStatus Status { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ModifiedAt { get; set; }
    public bool IsExcludedFromRecord { get; set; }
    
    // Validation: Comments must be approved by commission chair before inclusion in record
    public void Approve(Guid chairUserId)
    {
        if (Status != CommentStatus.Submitted)
            throw new InvalidOperationException("Only submitted comments can be approved");
            
        Status = CommentStatus.Approved;
        ApprovedBy = chairUserId;
        ApprovedAt = DateTimeOffset.UtcNow;
        ModifiedAt = DateTimeOffset.UtcNow;
    }
    
    public void Reject()
    {
        if (Status != CommentStatus.Submitted)
            throw new InvalidOperationException("Only submitted comments can be rejected");
            
        Status = CommentStatus.Rejected;
        ModifiedAt = DateTimeOffset.UtcNow;
    }
}
