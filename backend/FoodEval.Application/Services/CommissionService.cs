using FoodEval.Application.DTOs;
using FoodEval.Application.Interfaces;
using FoodEval.Domain.Entities;
using FoodEval.Domain.Enums;

namespace FoodEval.Application.Services;

public class CommissionService : ICommissionService
{
    private readonly ICommissionRepository _repository;
    private readonly ICommissionMemberRepository _memberRepository;
    private readonly IUserRepository _userRepository;

    public CommissionService(
        ICommissionRepository repository,
        ICommissionMemberRepository memberRepository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _memberRepository = memberRepository;
        _userRepository = userRepository;
    }

    public async Task<CommissionDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            return null;
        
        return await MapToDtoAsync(entity, cancellationToken);
    }

    public async Task<IEnumerable<CommissionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        var result = new List<CommissionDto>();
        
        foreach (var entity in entities)
        {
            result.Add(await MapToDtoAsync(entity, cancellationToken));
        }
        
        return result;
    }

    public async Task<IEnumerable<CommissionDto>> GetByEvaluationEventIdAsync(Guid evaluationEventId, CancellationToken cancellationToken = default)
    {
        // This method is kept for backward compatibility but will return empty list
        // since commissions are no longer tied to evaluation events
        return Enumerable.Empty<CommissionDto>();
    }

    public async Task<CommissionDto> CreateAsync(CreateCommissionRequest request, CancellationToken cancellationToken = default)
    {
        // Validate members
        ValidateMembers(request.Members);

        var entity = new Commission
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Status = CommissionStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var created = await _repository.CreateAsync(entity, cancellationToken);

        // Create members
        var now = DateTimeOffset.UtcNow;
        foreach (var memberRequest in request.Members)
        {
            // Verify user exists
            var user = await _userRepository.GetByIdAsync(memberRequest.UserId, cancellationToken);
            if (user == null)
                throw new KeyNotFoundException($"User with id {memberRequest.UserId} not found");

            // Verify user is a commission user (reviewer)
            if (user.UserType != UserType.CommissionUser)
                throw new InvalidOperationException($"User {user.Email} is not a reviewer (commission user). Only reviewers can be added to commissions.");

            var role = Enum.Parse<CommissionMemberRole>(memberRequest.Role);
            var member = new CommissionMember
            {
                Id = Guid.NewGuid(),
                CommissionId = created.Id,
                UserId = memberRequest.UserId,
                Role = role,
                IsExcluded = false,
                JoinedAt = now,
                CreatedAt = now
            };

            await _memberRepository.CreateAsync(member, cancellationToken);
        }

        return await MapToDtoAsync(created, cancellationToken);
    }

    public async Task<CommissionDto> UpdateAsync(Guid id, UpdateCommissionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Commission with id {id} not found");

        // Validate members
        ValidateMembers(request.Members);

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.Status = Enum.Parse<CommissionStatus>(request.Status);

        await _repository.UpdateAsync(entity, cancellationToken);

        // Update members: delete existing and create new ones
        var existingMembers = await _memberRepository.GetByCommissionIdAsync(id, cancellationToken);
        foreach (var existingMember in existingMembers)
        {
            await _memberRepository.DeleteAsync(existingMember.Id, cancellationToken);
        }

        // Create new members
        var now = DateTimeOffset.UtcNow;
        foreach (var memberRequest in request.Members)
        {
            // Verify user exists
            var user = await _userRepository.GetByIdAsync(memberRequest.UserId, cancellationToken);
            if (user == null)
                throw new KeyNotFoundException($"User with id {memberRequest.UserId} not found");

            // Verify user is a commission user (reviewer)
            if (user.UserType != UserType.CommissionUser)
                throw new InvalidOperationException($"User {user.Email} is not a reviewer (commission user). Only reviewers can be added to commissions.");

            var role = Enum.Parse<CommissionMemberRole>(memberRequest.Role);
            var member = new CommissionMember
            {
                Id = Guid.NewGuid(),
                CommissionId = id,
                UserId = memberRequest.UserId,
                Role = role,
                IsExcluded = false,
                JoinedAt = now,
                CreatedAt = now
            };

            await _memberRepository.CreateAsync(member, cancellationToken);
        }

        return await MapToDtoAsync(entity, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        // Delete all members first
        var members = await _memberRepository.GetByCommissionIdAsync(id, cancellationToken);
        foreach (var member in members)
        {
            await _memberRepository.DeleteAsync(member.Id, cancellationToken);
        }

        await _repository.DeleteAsync(id, cancellationToken);
    }

    private void ValidateMembers(List<CommissionMemberRequest> members)
    {
        if (members == null || members.Count == 0)
            throw new ArgumentException("Commission must have at least one member", nameof(members));

        // Validate exactly one MainMember
        var mainMemberCount = members.Count(m => m.Role == CommissionMemberRole.MainMember.ToString());
        if (mainMemberCount != 1)
            throw new ArgumentException("Commission must have exactly one Main Member", nameof(members));

        // Validate 0 or 1 President
        var presidentCount = members.Count(m => m.Role == CommissionMemberRole.President.ToString());
        if (presidentCount > 1)
            throw new ArgumentException("Commission can have at most one President", nameof(members));

        // Validate no duplicate users
        var userIds = members.Select(m => m.UserId).ToList();
        if (userIds.Count != userIds.Distinct().Count())
            throw new ArgumentException("Each user can only be assigned once to a commission", nameof(members));

        // Validate role values
        foreach (var member in members)
        {
            if (!Enum.TryParse<CommissionMemberRole>(member.Role, out _))
                throw new ArgumentException($"Invalid role: {member.Role}", nameof(members));
        }
    }

    private async Task<CommissionDto> MapToDtoAsync(Commission entity, CancellationToken cancellationToken)
    {
        var members = await _memberRepository.GetByCommissionIdAsync(entity.Id, cancellationToken);
        var memberDtos = new List<CommissionMemberDto>();

        foreach (var member in members)
        {
            var user = await _userRepository.GetByIdAsync(member.UserId, cancellationToken);
            if (user != null)
            {
                memberDtos.Add(new CommissionMemberDto
                {
                    Id = member.Id,
                    UserId = member.UserId,
                    UserFirstName = user.FirstName,
                    UserLastName = user.LastName,
                    UserEmail = user.Email,
                    Role = member.Role.ToString(),
                    IsExcluded = member.IsExcluded,
                    JoinedAt = member.JoinedAt
                });
            }
        }

        return new CommissionDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Status = entity.Status.ToString(),
            CreatedAt = entity.CreatedAt,
            Members = memberDtos
        };
    }
}
