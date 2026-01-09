using FoodEval.Application.DTOs;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public interface IPrijavaService
{
    // Organization user methods
    Task<IEnumerable<PrijavaDto>> GetByOrganizationIdAsync(
        Guid organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default);
    
    Task<PrijavaDto?> GetByIdAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
    
    Task<PrijavaDto> CreateAsync(Guid organizationId, CreatePrijavaRequest request, CancellationToken cancellationToken = default);
    
    Task<PrijavaDto> UpdateAsync(Guid id, Guid organizationId, UpdatePrijavaRequest request, CancellationToken cancellationToken = default);
    
    Task DeleteAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default);
    
    // Payment methods for org users
    Task<CreateStripeSessionResponse> CreateStripeSessionAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default);
    
    Task<CreateCardSessionResponse> CreateCardSessionAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default);
    
    Task<BankTransferInstructionsResponse> GetBankTransferInstructionsAsync(Guid prijavaId, Guid organizationId, CancellationToken cancellationToken = default);
    
    Task UploadBankTransferReceiptAsync(Guid prijavaId, Guid organizationId, string receiptUrl, CancellationToken cancellationToken = default);
    
    // Admin methods
    Task<IEnumerable<PrijavaDto>> GetAllAsync(
        Guid? organizationId,
        PrijavaStatus? status,
        Guid? itemId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        CancellationToken cancellationToken = default);
    
    Task<PrijavaDto?> GetByIdForAdminAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task ConfirmPaymentAsync(Guid prijavaId, Guid adminUserId, ConfirmPaymentRequest? request, CancellationToken cancellationToken = default);
    
    Task RejectPaymentAsync(Guid prijavaId, Guid adminUserId, RejectPaymentRequest request, CancellationToken cancellationToken = default);
}
