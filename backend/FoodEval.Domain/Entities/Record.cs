using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Record
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid ApplicantId { get; set; }
    public int RecordNumber { get; set; }
    public int Version { get; set; } = 1;
    public Guid? PreviousVersionId { get; set; }
    public decimal FinalScore { get; set; }
    public RecordStatus Status { get; set; }
    public DateTimeOffset? GeneratedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? AcknowledgedAt { get; set; }
    public string? PDFPath { get; set; }
    public DateTimeOffset VersionCreatedAt { get; set; }
    public Guid VersionCreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: First record version always has Version = 1
    // Validation: Each new version increments version number
    // Validation: PreviousVersionId links to immediate predecessor
    // Validation: Only latest version is considered active for sending
    // Validation: Version history is immutable (cannot delete or modify past versions)
    public Record CreateNewVersion(Guid createdBy)
    {
        return new Record
        {
            Id = Guid.NewGuid(),
            EventId = EventId,
            ProductSampleId = ProductSampleId,
            ApplicantId = ApplicantId,
            RecordNumber = RecordNumber,
            Version = Version + 1,
            PreviousVersionId = Id,
            FinalScore = FinalScore,
            Status = RecordStatus.Draft,
            VersionCreatedAt = DateTimeOffset.UtcNow,
            VersionCreatedBy = createdBy,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
    
    // Validation: Record status flow: Draft → Generated → Sent → Acknowledged
    public bool CanTransitionTo(RecordStatus newStatus)
    {
        return Status switch
        {
            RecordStatus.Draft => newStatus == RecordStatus.Generated,
            RecordStatus.Generated => newStatus == RecordStatus.Sent,
            RecordStatus.Sent => newStatus == RecordStatus.Acknowledged,
            RecordStatus.Acknowledged => false, // Acknowledged records cannot change
            _ => false
        };
    }
}
