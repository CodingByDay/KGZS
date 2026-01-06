using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Protocol
{
    public Guid Id { get; set; }
    public Guid EvaluationEventId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid ApplicantId { get; set; }
    public int ProtocolNumber { get; set; }
    public int Version { get; set; } = 1;
    public Guid? PreviousVersionId { get; set; }
    public decimal FinalScore { get; set; }
    public ProtocolStatus Status { get; set; }
    public DateTimeOffset? GeneratedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? AcknowledgedAt { get; set; }
    public string? PDFPath { get; set; }
    public DateTimeOffset VersionCreatedAt { get; set; }
    public Guid VersionCreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: First protocol version always has Version = 1
    // Validation: Each new version increments version number
    // Validation: PreviousVersionId links to immediate predecessor
    // Validation: Only latest version is considered active for sending
    // Validation: Version history is immutable (cannot delete or modify past versions)
    public Protocol CreateNewVersion(Guid createdBy)
    {
        return new Protocol
        {
            Id = Guid.NewGuid(),
            EvaluationEventId = EvaluationEventId,
            ProductSampleId = ProductSampleId,
            ApplicantId = ApplicantId,
            ProtocolNumber = ProtocolNumber,
            Version = Version + 1,
            PreviousVersionId = Id,
            FinalScore = FinalScore,
            Status = ProtocolStatus.Draft,
            VersionCreatedAt = DateTimeOffset.UtcNow,
            VersionCreatedBy = createdBy,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
    
    // Validation: Protocol status flow: Draft → Generated → Sent → Acknowledged
    public bool CanTransitionTo(ProtocolStatus newStatus)
    {
        return Status switch
        {
            ProtocolStatus.Draft => newStatus == ProtocolStatus.Generated,
            ProtocolStatus.Generated => newStatus == ProtocolStatus.Sent,
            ProtocolStatus.Sent => newStatus == ProtocolStatus.Acknowledged,
            ProtocolStatus.Acknowledged => false, // Acknowledged protocols cannot change
            _ => false
        };
    }
}
