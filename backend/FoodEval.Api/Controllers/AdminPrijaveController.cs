using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using FoodEval.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/admin/prijave")]
[Authorize(Roles = "SuperAdmin")]
public class AdminPrijaveController : ControllerBase
{
    private readonly IPrijavaService _prijavaService;

    public AdminPrijaveController(IPrijavaService prijavaService)
    {
        _prijavaService = prijavaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PrijavaDto>>> GetAllPrijave(
        [FromQuery] Guid? organizationId,
        [FromQuery] PrijavaStatus? status,
        [FromQuery] Guid? itemId,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        CancellationToken cancellationToken)
    {
        var prijave = await _prijavaService.GetAllAsync(
            organizationId, status, itemId, fromDate, toDate, cancellationToken);
        return Ok(prijave);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PrijavaDto>> GetPrijavaById(Guid id, CancellationToken cancellationToken)
    {
        var prijava = await _prijavaService.GetByIdForAdminAsync(id, cancellationToken);
        if (prijava == null)
            return NotFound();

        return Ok(prijava);
    }

    [HttpPost("{id}/confirm-payment")]
    public async Task<ActionResult> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentRequest? request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            await _prijavaService.ConfirmPaymentAsync(id, userId, request, cancellationToken);
            return Ok(new { message = "Payment confirmed successfully" });
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

    [HttpPost("{id}/reject-payment")]
    public async Task<ActionResult> RejectPayment(Guid id, [FromBody] RejectPaymentRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            await _prijavaService.RejectPaymentAsync(id, userId, request, cancellationToken);
            return Ok(new { message = "Payment rejected successfully" });
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
}
