using System.Security.Claims;
using FoodEval.Application.DTOs.Auth;
using FoodEval.Application.Interfaces;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IOrganizationRepository _organizationRepository;

    public AuthController(IAuthService authService, IOrganizationRepository organizationRepository)
    {
        _authService = authService;
        _organizationRepository = organizationRepository;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserInfoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId, cancellationToken);

        if (user == null)
        {
            return Unauthorized();
        }

        string? organizationName = null;
        if (user.OrganizationId.HasValue)
        {
            var organization = await _organizationRepository.GetByIdAsync(user.OrganizationId.Value, cancellationToken);
            organizationName = organization?.Name;
        }

        var response = new UserInfoResponse
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.PrimaryRole,
            UserType = user.UserType,
            OrganizationId = user.OrganizationId,
            OrganizationName = organizationName
        };

        return Ok(response);
    }
}
