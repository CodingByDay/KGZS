using FoodEval.Domain.Enums;

namespace FoodEval.Application.DTOs;

public class CommissionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public List<CommissionMemberDto> Members { get; set; } = new();
}

public class CommissionMemberDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserFirstName { get; set; } = string.Empty;
    public string UserLastName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // MainMember, President, Member, Trainee
    public bool IsExcluded { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
}

public class CommissionMemberRequest
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty; // MainMember, President, Member, Trainee
}

public class CreateCommissionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<CommissionMemberRequest> Members { get; set; } = new();
}

public class UpdateCommissionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<CommissionMemberRequest> Members { get; set; } = new();
}
