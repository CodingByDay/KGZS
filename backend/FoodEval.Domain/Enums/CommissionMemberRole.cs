namespace FoodEval.Domain.Enums;

public enum CommissionMemberRole
{
    MainMember,  // Glavni člen - can start evaluation if president is not present
    President,   // Predsednik - optional, can start evaluation
    Member,      // Člen - regular member
    Trainee      // Vajenec - trainee (can be excluded from calculation)
}
