using Domain.Enums;

namespace Domain.Entities;

public class Applicant
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid? UserId { get; set; }
    public string? CompanyName { get; set; }
    public string ContactPersonName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Region { get; set; }
    public ApplicantStatus Status { get; set; }
    public DateTimeOffset RegistrationDate { get; set; }
    public DateTimeOffset? PaymentConfirmedAt { get; set; }
    
    // Validation: Email must be verified before submission is accepted
    public bool EmailVerified { get; set; }
    
    // Validation: Phone number must be verified via SMS before submission is accepted
    public bool PhoneNumberVerified { get; set; }
    
    // Validation: Applicant can submit samples only if payment is confirmed (if required)
    public bool CanSubmitSamples(bool eventPaymentRequired)
    {
        if (!EmailVerified || !PhoneNumberVerified)
            return false;
            
        if (eventPaymentRequired && Status != ApplicantStatus.PaymentConfirmed)
            return false;
            
        return Status == ApplicantStatus.Submitted || Status == ApplicantStatus.PaymentConfirmed;
    }
}
