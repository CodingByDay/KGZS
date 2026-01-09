using FoodEval.Domain.Enums;

namespace FoodEval.Application.DTOs;

public class PrijavaDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public DateTimeOffset ReviewDueDate { get; set; }
    public PrijavaStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public PrijavaPaymentDto? Payment { get; set; }
}

public class PrijavaPaymentDto
{
    public Guid Id { get; set; }
    public Guid PrijavaId { get; set; }
    public PrijavaPaymentMethod PaymentMethod { get; set; }
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
    public PrijavaPaymentStatus PaymentStatus { get; set; }
    public string? ProviderSessionId { get; set; }
    public string? PaymentIntentId { get; set; }
    public string? BankTransferReceiptUrl { get; set; }
    public Guid? AdminConfirmedByUserId { get; set; }
    public string? AdminConfirmedByUserName { get; set; }
    public DateTimeOffset? AdminConfirmedAt { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class CreatePrijavaRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public Guid ItemId { get; set; }

    [System.ComponentModel.DataAnnotations.Required]
    public DateTimeOffset ReviewDueDate { get; set; }
}

public class UpdatePrijavaRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public Guid ItemId { get; set; }

    [System.ComponentModel.DataAnnotations.Required]
    public DateTimeOffset ReviewDueDate { get; set; }
}

public class CreateStripeSessionRequest
{
    // Can add amount/currency here if needed
    // For now, using nullable Amount in payment entity
}

public class CreateStripeSessionResponse
{
    public string CheckoutUrl { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}

public class CreateCardSessionRequest
{
    // Placeholder for second payment provider
    // TODO: Implement when provider is available
}

public class CreateCardSessionResponse
{
    public string CheckoutUrl { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}

public class BankTransferInstructionsResponse
{
    public string Iban { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
}

public class ConfirmPaymentRequest
{
    public string? Notes { get; set; }
}

public class RejectPaymentRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string Reason { get; set; } = string.Empty;
}
