using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string? RecipientPhone { get; set; }
    public NotificationType NotificationType { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Notification delivery status must be tracked
    public void MarkAsSent()
    {
        if (Status != NotificationStatus.Pending)
            throw new InvalidOperationException("Only pending notifications can be marked as sent");
            
        Status = NotificationStatus.Sent;
        SentAt = DateTimeOffset.UtcNow;
    }
}
