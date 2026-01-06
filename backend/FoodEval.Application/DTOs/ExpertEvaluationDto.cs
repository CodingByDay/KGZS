namespace FoodEval.Application.DTOs;

public class ExpertEvaluationDto
{
    public Guid Id { get; set; }
    public Guid EvaluationSessionId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid CommissionMemberId { get; set; }
    public decimal? FinalScore { get; set; }
    public bool IsSampleExcludedByEvaluator { get; set; }
    public string? ExclusionNote { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ModifiedAt { get; set; }
    public bool IsExcludedFromCalculation { get; set; }
}

public class CreateExpertEvaluationRequest
{
    public Guid EvaluationSessionId { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid CommissionMemberId { get; set; }
    public decimal? FinalScore { get; set; }
    public bool IsSampleExcludedByEvaluator { get; set; }
    public string? ExclusionNote { get; set; }
}

public class UpdateExpertEvaluationRequest
{
    public decimal? FinalScore { get; set; }
    public bool IsSampleExcludedByEvaluator { get; set; }
    public string? ExclusionNote { get; set; }
}

public class UpdateEvaluationStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
