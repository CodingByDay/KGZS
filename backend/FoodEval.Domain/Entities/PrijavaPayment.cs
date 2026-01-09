using FoodEval.Domain.Enums;

namespace FoodEval.Domain.Entities;

public class PrijavaPayment
{
    public Guid Id { get; set; }
    public Guid PrijavaId { get; set; } // Required
    public PrijavaPaymentMethod PaymentMethod { get; set; }
    public decimal? Amount { get; set; } // Nullable if pricing not implemented yet
    public string? Currency { get; set; } // Nullable if pricing not implemented yet
    public PrijavaPaymentStatus PaymentStatus { get; set; } = PrijavaPaymentStatus.Unpaid;
    
    // Provider session IDs for Stripe and card provider
    public string? ProviderSessionId { get; set; } // Stripe session ID
    public string? PaymentIntentId { get; set; } // Stripe payment intent or card provider ID
    
    // Bank transfer receipt
    public string? BankTransferReceiptUrl { get; set; } // File reference for uploaded receipt
    
    // Admin confirmation
    public Guid? AdminConfirmedByUserId { get; set; }
    public DateTimeOffset? AdminConfirmedAt { get; set; }
    
    // Notes (admin optional)
    public string? Notes { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    
    // Navigation properties (for EF Core)
    public Prijava? Prijava { get; set; }
    public User? AdminConfirmedByUser { get; set; }
}
