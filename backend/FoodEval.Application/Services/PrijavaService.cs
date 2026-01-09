using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class PrijavaService : IPrijavaService
{
    private readonly IPrijavaRepository _prijavaRepository;
    private readonly IPrijavaPaymentRepository _paymentRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOrganizationRepository _organizationRepository;
    private readonly IUserRepository _userRepository;

    public PrijavaService(
        IPrijavaRepository prijavaRepository,
        IPrijavaPaymentRepository paymentRepository,
        IProductRepository productRepository,
        IOrganizationRepository organizationRepository,
        IUserRepository userRepository)
    {
        _prijavaRepository = prijavaRepository;
        _paymentRepository = paymentRepository;
        _productRepository = productRepository;
        _organizationRepository = organizationRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<PrijavaDto>> GetByOrganizationIdAsync(
        Guid organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default)
    {
        var prijave = await _prijavaRepository.SearchByOrganizationIdAsync(
            organizationId, status, itemId, fromDate, toDate, cancellationToken);
        
        var result = new List<PrijavaDto>();
        foreach (var prijava in prijave)
        {
            var dto = await MapToDtoAsync(prijava, cancellationToken);
            result.Add(dto);
        }
        return result;
    }

    public async Task<PrijavaDto?> GetByIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (prijava == null) return null;
        
        return await MapToDtoAsync(prijava, cancellationToken);
    }

    public async Task<PrijavaDto> CreateAsync(Guid organizationId, CreatePrijavaRequest request, CancellationToken cancellationToken = default)
    {
        // Validate organization exists
        var organization = await _organizationRepository.GetByIdAsync(organizationId, cancellationToken);
        if (organization == null)
            throw new KeyNotFoundException($"Organization with id {organizationId} not found");

        // Validate item exists and belongs to organization
        var item = await _productRepository.GetByIdAndOrganizationIdAsync(request.ItemId, organizationId, cancellationToken);
        if (item == null)
            throw new InvalidOperationException($"Item with id {request.ItemId} not found or does not belong to organization {organizationId}");

        // Validate due date is not in the past
        if (request.ReviewDueDate < DateTimeOffset.UtcNow.Date)
            throw new InvalidOperationException("Review due date cannot be in the past");

        var prijava = new Prijava
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            ItemId = request.ItemId,
            ReviewDueDate = request.ReviewDueDate,
            Status = PrijavaStatus.PendingPayment,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _prijavaRepository.CreateAsync(prijava, cancellationToken);
        return await MapToDtoAsync(created, cancellationToken);
    }

    public async Task<PrijavaDto> UpdateAsync(Guid id, Guid organizationId, UpdatePrijavaRequest request, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {id} not found or does not belong to organization {organizationId}");

        // Only allow edits if still in payment phase
        if (prijava.Status != PrijavaStatus.PendingPayment && prijava.Status != PrijavaStatus.PendingAdminConfirmation)
            throw new InvalidOperationException("Prijava can only be edited while in payment phase");

        // Validate item exists and belongs to organization
        var item = await _productRepository.GetByIdAndOrganizationIdAsync(request.ItemId, organizationId, cancellationToken);
        if (item == null)
            throw new InvalidOperationException($"Item with id {request.ItemId} not found or does not belong to organization {organizationId}");

        // Validate due date is not in the past
        if (request.ReviewDueDate < DateTimeOffset.UtcNow.Date)
            throw new InvalidOperationException("Review due date cannot be in the past");

        prijava.ItemId = request.ItemId;
        prijava.ReviewDueDate = request.ReviewDueDate;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;

        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);
        return await MapToDtoAsync(prijava, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(id, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {id} not found or does not belong to organization {organizationId}");

        // Only allow deletion before admin confirmation
        if (prijava.Status == PrijavaStatus.PendingReview)
            throw new InvalidOperationException("Cannot delete prijava that has been confirmed by admin");

        await _prijavaRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<CreateStripeSessionResponse> CreateStripeSessionAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(prijavaId, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found or does not belong to organization {organizationId}");

        if (prijava.Status != PrijavaStatus.PendingPayment)
            throw new InvalidOperationException("Payment can only be initiated for prijave in PendingPayment status");

        // TODO: Integrate with Stripe API
        // For now, create a placeholder payment record
        var payment = new PrijavaPayment
        {
            Id = Guid.NewGuid(),
            PrijavaId = prijavaId,
            PaymentMethod = PrijavaPaymentMethod.Stripe,
            PaymentStatus = PrijavaPaymentStatus.Submitted,
            ProviderSessionId = $"stripe_session_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _paymentRepository.CreateAsync(payment, cancellationToken);

        // Update prijava status
        prijava.Status = PrijavaStatus.PendingAdminConfirmation;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;
        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);

        // TODO: Return actual Stripe checkout URL
        return new CreateStripeSessionResponse
        {
            SessionId = payment.ProviderSessionId!,
            CheckoutUrl = $"https://checkout.stripe.com/pay/{payment.ProviderSessionId}" // Placeholder
        };
    }

    public async Task<CreateCardSessionResponse> CreateCardSessionAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(prijavaId, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found or does not belong to organization {organizationId}");

        if (prijava.Status != PrijavaStatus.PendingPayment)
            throw new InvalidOperationException("Payment can only be initiated for prijave in PendingPayment status");

        // TODO: Implement second payment provider when available
        // For now, create a placeholder payment record
        var payment = new PrijavaPayment
        {
            Id = Guid.NewGuid(),
            PrijavaId = prijavaId,
            PaymentMethod = PrijavaPaymentMethod.Card,
            PaymentStatus = PrijavaPaymentStatus.Submitted,
            ProviderSessionId = $"card_session_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _paymentRepository.CreateAsync(payment, cancellationToken);

        // Update prijava status
        prijava.Status = PrijavaStatus.PendingAdminConfirmation;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;
        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);

        // TODO: Return actual card provider checkout URL
        return new CreateCardSessionResponse
        {
            SessionId = payment.ProviderSessionId!,
            CheckoutUrl = $"https://payment.example.com/checkout/{payment.ProviderSessionId}" // Placeholder
        };
    }

    public async Task<BankTransferInstructionsResponse> GetBankTransferInstructionsAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(prijavaId, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found or does not belong to organization {organizationId}");

        // TODO: Get actual bank details from configuration
        return new BankTransferInstructionsResponse
        {
            Iban = "SI56 1910 0000 0123 456", // Placeholder
            Reference = $"PRIJAVA-{prijavaId.ToString().Substring(0, 8).ToUpper()}",
            Recipient = "Food Evaluation System",
            Amount = null, // Can be set if pricing is implemented
            Currency = "EUR"
        };
    }

    public async Task UploadBankTransferReceiptAsync(Guid prijavaId, Guid organizationId, string receiptUrl, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAndOrganizationIdAsync(prijavaId, organizationId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found or does not belong to organization {organizationId}");

        if (prijava.Status != PrijavaStatus.PendingPayment)
            throw new InvalidOperationException("Receipt can only be uploaded for prijave in PendingPayment status");

        // Create or update payment record
        var existingPayment = await _paymentRepository.GetLatestByPrijavaIdAsync(prijavaId, cancellationToken);
        
        PrijavaPayment payment;
        if (existingPayment != null && existingPayment.PaymentMethod == PrijavaPaymentMethod.BankTransfer)
        {
            payment = existingPayment;
            payment.BankTransferReceiptUrl = receiptUrl;
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _paymentRepository.UpdateAsync(payment, cancellationToken);
        }
        else
        {
            payment = new PrijavaPayment
            {
                Id = Guid.NewGuid(),
                PrijavaId = prijavaId,
                PaymentMethod = PrijavaPaymentMethod.BankTransfer,
                PaymentStatus = PrijavaPaymentStatus.Submitted,
                BankTransferReceiptUrl = receiptUrl,
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _paymentRepository.CreateAsync(payment, cancellationToken);
        }

        // Update prijava status
        prijava.Status = PrijavaStatus.PendingAdminConfirmation;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;
        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);
    }

    public async Task<IEnumerable<PrijavaDto>> GetAllAsync(
        Guid? organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default)
    {
        var prijave = await _prijavaRepository.GetAllAsync(organizationId, status, itemId, fromDate, toDate, cancellationToken);
        
        var result = new List<PrijavaDto>();
        foreach (var prijava in prijave)
        {
            var dto = await MapToDtoAsync(prijava, cancellationToken);
            result.Add(dto);
        }
        return result;
    }

    public async Task<PrijavaDto?> GetByIdForAdminAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAsync(id, cancellationToken);
        if (prijava == null) return null;
        
        return await MapToDtoAsync(prijava, cancellationToken);
    }

    public async Task ConfirmPaymentAsync(Guid prijavaId, Guid adminUserId, ConfirmPaymentRequest? request, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAsync(prijavaId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found");

        if (prijava.Status != PrijavaStatus.PendingAdminConfirmation)
            throw new InvalidOperationException("Payment can only be confirmed for prijave in PendingAdminConfirmation status");

        var payment = await _paymentRepository.GetLatestByPrijavaIdAsync(prijavaId, cancellationToken);
        if (payment == null)
            throw new InvalidOperationException("No payment found for this prijava");

        // Validate payment evidence
        bool hasEvidence = false;
        if (payment.PaymentMethod == PrijavaPaymentMethod.BankTransfer)
        {
            hasEvidence = !string.IsNullOrEmpty(payment.BankTransferReceiptUrl);
        }
        else if (payment.PaymentMethod == PrijavaPaymentMethod.Stripe || payment.PaymentMethod == PrijavaPaymentMethod.Card)
        {
            // TODO: Verify with payment provider that payment was successful
            hasEvidence = payment.PaymentStatus == PrijavaPaymentStatus.Submitted || payment.PaymentStatus == PrijavaPaymentStatus.Paid;
        }

        if (!hasEvidence)
            throw new InvalidOperationException("Payment evidence is missing or invalid");

        // Update payment
        payment.PaymentStatus = PrijavaPaymentStatus.Paid;
        payment.AdminConfirmedByUserId = adminUserId;
        payment.AdminConfirmedAt = DateTimeOffset.UtcNow;
        payment.Notes = request?.Notes;
        payment.UpdatedAt = DateTimeOffset.UtcNow;
        await _paymentRepository.UpdateAsync(payment, cancellationToken);

        // Update prijava status to PendingReview (green)
        prijava.Status = PrijavaStatus.PendingReview;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;
        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);
    }

    public async Task RejectPaymentAsync(Guid prijavaId, Guid adminUserId, RejectPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var prijava = await _prijavaRepository.GetByIdAsync(prijavaId, cancellationToken);
        if (prijava == null)
            throw new KeyNotFoundException($"Prijava with id {prijavaId} not found");

        var payment = await _paymentRepository.GetLatestByPrijavaIdAsync(prijavaId, cancellationToken);
        if (payment == null)
            throw new InvalidOperationException("No payment found for this prijava");

        // Update payment
        payment.PaymentStatus = PrijavaPaymentStatus.Rejected;
        payment.Notes = request.Reason;
        payment.UpdatedAt = DateTimeOffset.UtcNow;
        await _paymentRepository.UpdateAsync(payment, cancellationToken);

        // Return prijava to PendingPayment
        prijava.Status = PrijavaStatus.PendingPayment;
        prijava.UpdatedAt = DateTimeOffset.UtcNow;
        await _prijavaRepository.UpdateAsync(prijava, cancellationToken);
    }

    private async Task<PrijavaDto> MapToDtoAsync(Prijava prijava, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetLatestByPrijavaIdAsync(prijava.Id, cancellationToken);
        
        var dto = new PrijavaDto
        {
            Id = prijava.Id,
            OrganizationId = prijava.OrganizationId,
            OrganizationName = prijava.Organization?.Name ?? string.Empty,
            ItemId = prijava.ItemId,
            ItemName = prijava.Item?.Name ?? string.Empty,
            ReviewDueDate = prijava.ReviewDueDate,
            Status = prijava.Status,
            CreatedAt = prijava.CreatedAt,
            UpdatedAt = prijava.UpdatedAt,
            Payment = payment != null ? await MapPaymentToDtoAsync(payment, cancellationToken) : null
        };
        
        return dto;
    }

    private async Task<PrijavaPaymentDto> MapPaymentToDtoAsync(PrijavaPayment payment, CancellationToken cancellationToken)
    {
        var adminUser = payment.AdminConfirmedByUserId.HasValue
            ? await _userRepository.GetByIdAsync(payment.AdminConfirmedByUserId.Value, cancellationToken)
            : null;

        return new PrijavaPaymentDto
        {
            Id = payment.Id,
            PrijavaId = payment.PrijavaId,
            PaymentMethod = payment.PaymentMethod,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentStatus = payment.PaymentStatus,
            ProviderSessionId = payment.ProviderSessionId,
            PaymentIntentId = payment.PaymentIntentId,
            BankTransferReceiptUrl = payment.BankTransferReceiptUrl,
            AdminConfirmedByUserId = payment.AdminConfirmedByUserId,
            AdminConfirmedByUserName = adminUser != null ? $"{adminUser.FirstName} {adminUser.LastName}" : null,
            AdminConfirmedAt = payment.AdminConfirmedAt,
            Notes = payment.Notes,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}
