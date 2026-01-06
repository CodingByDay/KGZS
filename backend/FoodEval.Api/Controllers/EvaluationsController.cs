using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluationsController : ControllerBase
{
    private readonly IEvaluationEventService _service;

    public EvaluationsController(IEvaluationEventService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EvaluationEventDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EvaluationEventDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<EvaluationEventDto>> Create([FromBody] CreateEvaluationEventRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var created = await _service.CreateAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<EvaluationEventDto>> Update(Guid id, [FromBody] UpdateEvaluationEventRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _service.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{id}/events")]
    public async Task<ActionResult<IEnumerable<EvaluationSessionDto>>> GetEvaluationSessions(Guid id, CancellationToken cancellationToken)
    {
        var sessions = await _service.GetEvaluationSessionsAsync(id, cancellationToken);
        return Ok(sessions);
    }

    [HttpPost("{id}/events")]
    [Authorize(Roles = "CommissionChair,Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<EvaluationSessionDto>> CreateEvaluationSession(Guid id, [FromBody] CreateEvaluationSessionRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var created = await _service.CreateEvaluationSessionAsync(id, request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetEvaluationSessions), new { id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/scores")]
    public async Task<ActionResult<IEnumerable<ScoreDto>>> GetScores(Guid id, CancellationToken cancellationToken)
    {
        var scores = await _service.GetScoresAsync(id, cancellationToken);
        return Ok(scores);
    }

    [HttpPost("scores/calculate")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<ScoreDto>> CalculateScore([FromBody] Guid productSampleId, CancellationToken cancellationToken)
    {
        try
        {
            var score = await _service.CalculateScoreAsync(productSampleId, cancellationToken);
            return Ok(score);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<EvaluationEventDto>> UpdateStatus(Guid id, [FromBody] UpdateEvaluationStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var evaluation = await _service.GetByIdAsync(id, cancellationToken);
            if (evaluation == null)
                return NotFound();

            var updateRequest = new UpdateEvaluationEventRequest
            {
                Name = evaluation.Name,
                Description = evaluation.Description ?? string.Empty,
                StartDate = evaluation.StartDate,
                EndDate = evaluation.EndDate,
                Status = request.Status,
                PaymentRequired = evaluation.PaymentRequired,
                AllowConsumerEvaluation = evaluation.AllowConsumerEvaluation
            };

            var updated = await _service.UpdateAsync(id, updateRequest, cancellationToken);
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
}
