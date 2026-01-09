namespace FoodEval.Domain.Enums;

public enum PrijavaPaymentStatus
{
    Unpaid = 0,
    Submitted = 1,      // Payment submitted but not confirmed
    Paid = 2,           // Payment confirmed
    Rejected = 3        // Payment rejected by admin
}
