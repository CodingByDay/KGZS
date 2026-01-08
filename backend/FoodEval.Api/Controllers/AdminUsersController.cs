using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "SuperAdmin")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserManagementService _service;

    public AdminUsersController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await _service.GetAllUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _service.GetUserByIdAsync(id, cancellationToken);
        if (user == null)
            return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _service.CreateUserAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetUserById), new { id = created.Id }, created);
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

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _service.UpdateUserAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/email")]
    public async Task<ActionResult<UserDto>> UpdateUserEmail(Guid id, [FromBody] UpdateEmailRequest request, CancellationToken cancellationToken)
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
    public async Task<ActionResult> UpdateUserPassword(Guid id, [FromBody] UpdatePasswordRequest request, CancellationToken cancellationToken)
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

    [HttpPut("{id}/profile")]
    public async Task<ActionResult<UserDto>> UpdateUserProfile(Guid id, [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
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

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
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
