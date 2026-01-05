using Domain.Enums;

namespace Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public AuditAction Action { get; set; }
    public Guid? UserId { get; set; }
    public string? Changes { get; set; } // JSON, before/after values
    public DateTimeOffset Timestamp { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    
    // Validation: Audit log entries are immutable (cannot be deleted or modified)
    // Validation: Audit log must capture: who, what, when, before/after values
}
