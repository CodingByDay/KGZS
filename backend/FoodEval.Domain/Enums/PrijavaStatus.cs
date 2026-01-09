namespace FoodEval.Domain.Enums;

public enum PrijavaStatus
{
    PendingPayment = 0,           // Default on create
    PendingAdminConfirmation = 1, // After bank receipt uploaded OR after gateway initiated
    PendingReview = 2,            // Green, after super admin confirmation
    Rejected = 3,                 // Optional: if payment rejected
    Cancelled = 4                 // Optional: if cancelled
}
