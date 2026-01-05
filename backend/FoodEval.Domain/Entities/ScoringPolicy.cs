namespace Domain.Entities;

public class ScoringPolicy
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public int TrimHighLowFromCount { get; set; } = 5;
    public int TrimCountHigh { get; set; } = 1;
    public int TrimCountLow { get; set; } = 1;
    public int RoundingDecimals { get; set; } = 2;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ModifiedAt { get; set; }
    
    // Validation: Each event has exactly one scoring policy
    // Validation: Default values: TrimHighLowFromCount=5, TrimCountHigh=1, TrimCountLow=1, RoundingDecimals=2
    // Validation: Score calculation uses the event's ScoringPolicy configuration
    public bool ShouldTrimScores(int evaluationCount) => evaluationCount >= TrimHighLowFromCount;
}
