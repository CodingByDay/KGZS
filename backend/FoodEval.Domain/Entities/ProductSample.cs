using Domain.Enums;

namespace Domain.Entities;

public class ProductSample
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid CategoryId { get; set; }
    public int SequentialNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string QRCode { get; set; } = string.Empty;
    public string? LabelData { get; set; }
    public EvaluationMode EvaluationMode { get; set; }
    public ProductSampleStatus Status { get; set; }
    public DateTimeOffset? ExcludedAt { get; set; }
    public string? ExclusionReason { get; set; }
    public decimal? FinalScore { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? EvaluatedAt { get; set; }
    
    // Validation: Sequential number must be unique within an event
    // Validation: QR code must be globally unique (across all events)
    // Validation: Sample exclusion requires a mandatory reason
    public void Exclude(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Exclusion reason is required", nameof(reason));
            
        if (Status == ProductSampleStatus.Completed)
            throw new InvalidOperationException("Cannot exclude a completed sample");
            
        Status = ProductSampleStatus.Excluded;
        ExclusionReason = reason;
        ExcludedAt = DateTimeOffset.UtcNow;
    }
    
    // Validation: Sample status cannot be changed after "Completed"
    public bool CanChangeStatus() => Status != ProductSampleStatus.Completed;
    
    // Validation: Product sample status flow: Draft → Submitted → Evaluated/Excluded → Completed
    public bool CanTransitionTo(ProductSampleStatus newStatus)
    {
        return Status switch
        {
            ProductSampleStatus.Draft => newStatus == ProductSampleStatus.Submitted,
            ProductSampleStatus.Submitted => newStatus == ProductSampleStatus.Evaluated || 
                                           newStatus == ProductSampleStatus.Excluded,
            ProductSampleStatus.Evaluated => newStatus == ProductSampleStatus.Completed,
            ProductSampleStatus.Excluded => false, // Excluded samples cannot transition
            ProductSampleStatus.Completed => false, // Completed samples cannot change
            _ => false
        };
    }
}
