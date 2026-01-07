using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/organizations")]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _service;

    public OrganizationsController(IOrganizationService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetAllOrganizations(CancellationToken cancellationToken)
    {
        var organizations = await _service.GetAllOrganizationsAsync(cancellationToken);
        return Ok(organizations);
    }


    [HttpGet("me")]
    [Authorize(Roles = "OrganizationAdmin")]
    public async Task<ActionResult<OrganizationDto>> GetMyOrganization(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var organization = await _service.GetMyOrganizationAsync(userId, cancellationToken);
            return Ok(organization);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("me/users")]
    [Authorize(Roles = "OrganizationAdmin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetMyOrganizationUsers(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var users = await _service.GetOrganizationUsersAsync(organizationId, cancellationToken);
            return Ok(users);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("me/users")]
    [Authorize(Roles = "OrganizationAdmin")]
    public async Task<ActionResult<UserDto>> CreateOrganizationUser(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var created = await _service.CreateOrganizationUserAsync(organizationId, request, cancellationToken);
            return CreatedAtAction(nameof(GetMyOrganizationUsers), null, created);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
