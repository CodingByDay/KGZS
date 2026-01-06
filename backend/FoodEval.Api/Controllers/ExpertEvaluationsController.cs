using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpertEvaluationsController : ControllerBase
{
    private readonly IExpertEvaluationService _service;

    public ExpertEvaluationsController(IExpertEvaluationService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpertEvaluationDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpGet("session/{evaluationSessionId}")]
    public async Task<ActionResult<IEnumerable<ExpertEvaluationDto>>> GetByEvaluationSessionId(Guid evaluationSessionId, CancellationToken cancellationToken)
    {
        var items = await _service.GetByEvaluationSessionIdAsync(evaluationSessionId, cancellationToken);
        return Ok(items);
    }

    [HttpGet("product/{productSampleId}")]
    public async Task<ActionResult<IEnumerable<ExpertEvaluationDto>>> GetByProductSampleId(Guid productSampleId, CancellationToken cancellationToken)
    {
        var items = await _service.GetByProductSampleIdAsync(productSampleId, cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "CommissionMember,CommissionChair,Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<ExpertEvaluationDto>> Create([FromBody] CreateExpertEvaluationRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var created = await _service.CreateAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "CommissionMember,CommissionChair,Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<ExpertEvaluationDto>> Update(Guid id, [FromBody] UpdateExpertEvaluationRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var updated = await _service.UpdateAsync(id, request, userId, cancellationToken);
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "CommissionMember,CommissionChair,Organizer,Administrator,SuperAdmin")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            await _service.SubmitAsync(id, userId, cancellationToken);
            return Ok(new { message = "Evaluation submitted successfully" });
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
