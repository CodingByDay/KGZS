using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/admin/superadmins")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminsController : ControllerBase
{
    private readonly IUserManagementService _service;

    public SuperAdminsController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetSuperAdmins(CancellationToken cancellationToken)
    {
        var superAdmins = await _service.GetSuperAdminsAsync(cancellationToken);
        return Ok(superAdmins);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateSuperAdmin([FromBody] CreateSuperAdminRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _service.CreateSuperAdminAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetSuperAdmins), null, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/profile")]
    public async Task<ActionResult<UserDto>> UpdateSuperAdminProfile(Guid id, [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _service.UpdateUserProfileAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/email")]
    public async Task<ActionResult<UserDto>> UpdateSuperAdminEmail(Guid id, [FromBody] UpdateEmailRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _service.UpdateUserEmailAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/password")]
    public async Task<ActionResult> UpdateSuperAdminPassword(Guid id, [FromBody] UpdatePasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _service.UpdateUserPasswordAsync(id, request, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSuperAdmin(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _service.DeleteUserAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
