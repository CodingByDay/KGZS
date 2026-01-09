using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using FoodEval.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/org/prijave")]
[Authorize]
public class OrgPrijaveController : ControllerBase
{
    private readonly IPrijavaService _prijavaService;

    public OrgPrijaveController(IPrijavaService prijavaService)
    {
        _prijavaService = prijavaService;
    }

    [HttpGet]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<IEnumerable<PrijavaDto>>> GetPrijave(
        [FromQuery] PrijavaStatus? status,
        [FromQuery] Guid? itemId,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        var prijave = await _prijavaService.GetByOrganizationIdAsync(
            organizationId, status, itemId, fromDate, toDate, cancellationToken);
        return Ok(prijave);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<PrijavaDto>> GetPrijavaById(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        var prijava = await _prijavaService.GetByIdAsync(id, organizationId, cancellationToken);
        if (prijava == null)
            return NotFound();

        return Ok(prijava);
    }

    [HttpPost]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<PrijavaDto>> CreatePrijava([FromBody] CreatePrijavaRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var created = await _prijavaService.CreateAsync(organizationId, request, cancellationToken);
            return CreatedAtAction(nameof(GetPrijavaById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<PrijavaDto>> UpdatePrijava(Guid id, [FromBody] UpdatePrijavaRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var updated = await _prijavaService.UpdateAsync(id, organizationId, request, cancellationToken);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult> DeletePrijava(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            await _prijavaService.DeleteAsync(id, organizationId, cancellationToken);
            return NoContent();
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

    [HttpPost("{id}/payments/stripe/create-session")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<CreateStripeSessionResponse>> CreateStripeSession(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var response = await _prijavaService.CreateStripeSessionAsync(id, organizationId, cancellationToken);
            return Ok(response);
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

    [HttpPost("{id}/payments/card/create-session")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<CreateCardSessionResponse>> CreateCardSession(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var response = await _prijavaService.CreateCardSessionAsync(id, organizationId, cancellationToken);
            return Ok(response);
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

    [HttpGet("{id}/payments/bank-transfer/instructions")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<BankTransferInstructionsResponse>> GetBankTransferInstructions(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var instructions = await _prijavaService.GetBankTransferInstructionsAsync(id, organizationId, cancellationToken);
            return Ok(instructions);
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

    [HttpPost("{id}/payments/bank-transfer/upload-receipt")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult> UploadBankTransferReceipt(Guid id, [FromBody] UploadReceiptRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            await _prijavaService.UploadBankTransferReceiptAsync(id, organizationId, request.ReceiptUrl, cancellationToken);
            return Ok(new { message = "Receipt uploaded successfully" });
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

public class UploadReceiptRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string ReceiptUrl { get; set; } = string.Empty;
}
