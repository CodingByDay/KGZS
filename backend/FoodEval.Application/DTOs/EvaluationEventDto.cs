namespace FoodEval.Application.DTOs;

public class EvaluationEventDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public bool PaymentRequired { get; set; }
    public bool AllowConsumerEvaluation { get; set; }
}

public class CreateEvaluationEventRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public bool PaymentRequired { get; set; }
    public bool AllowConsumerEvaluation { get; set; }
}

public class UpdateEvaluationEventRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool PaymentRequired { get; set; }
    public bool AllowConsumerEvaluation { get; set; }
}

public class EvaluationSessionDto
{
    public Guid Id { get; set; }
    public Guid ProductSampleId { get; set; }
    public Guid CommissionId { get; set; }
    public Guid ActivatedBy { get; set; }
    public DateTimeOffset ActivatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateEvaluationSessionRequest
{
    public Guid ProductSampleId { get; set; }
    public Guid CommissionId { get; set; }
}

public class ScoreDto
{
    public Guid ProductSampleId { get; set; }
    public decimal? FinalScore { get; set; }
    public int EvaluationCount { get; set; }
    public DateTimeOffset? CalculatedAt { get; set; }
}
