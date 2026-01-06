using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid ApplicantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? TransactionId { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    
    // Validation: Payment must belong to the same event as the applicant
    // This is enforced at the application service layer
}
