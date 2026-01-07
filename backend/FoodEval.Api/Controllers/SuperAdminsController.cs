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
}
