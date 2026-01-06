namespace FoodEval.Application.DTOs;

public class ProductSampleDto
{
    public Guid Id { get; set; }
    public Guid EvaluationEventId { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid CategoryId { get; set; }
    public int SequentialNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string QRCode { get; set; } = string.Empty;
    public string? LabelData { get; set; }
    public string EvaluationMode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? ExcludedAt { get; set; }
    public string? ExclusionReason { get; set; }
    public decimal? FinalScore { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? EvaluatedAt { get; set; }
}

public class CreateProductSampleRequest
{
    public Guid EvaluationEventId { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string EvaluationMode { get; set; } = string.Empty;
}

public class UpdateProductSampleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
}
