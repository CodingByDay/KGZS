namespace FoodEval.Application.DTOs;

public class ProtocolDto
{
    public Guid Id { get; set; }
    public Guid EvaluationEventId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid ApplicantId { get; set; }
    public int ProtocolNumber { get; set; }
    public int Version { get; set; }
    public Guid? PreviousVersionId { get; set; }
    public decimal FinalScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? GeneratedAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? AcknowledgedAt { get; set; }
    public string? PDFPath { get; set; }
    public DateTimeOffset VersionCreatedAt { get; set; }
    public Guid VersionCreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class GenerateProtocolRequest
{
    public Guid ProductSampleId { get; set; }
}
