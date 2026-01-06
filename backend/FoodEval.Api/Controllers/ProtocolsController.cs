using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProtocolsController : ControllerBase
{
    private readonly IProtocolService _service;

    public ProtocolsController(IProtocolService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProtocolDto>>> GetAll([FromQuery] Guid? evaluationEventId, [FromQuery] Guid? productSampleId, CancellationToken cancellationToken)
    {
        IEnumerable<ProtocolDto> items;
        if (productSampleId.HasValue)
        {
            items = await _service.GetByProductSampleIdAsync(productSampleId.Value, cancellationToken);
        }
        else if (evaluationEventId.HasValue)
        {
            items = await _service.GetByEvaluationEventIdAsync(evaluationEventId.Value, cancellationToken);
        }
        else
        {
            items = await _service.GetAllAsync(cancellationToken);
        }
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProtocolDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<ProtocolDto>> GenerateProtocol([FromBody] GenerateProtocolRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var protocol = await _service.GenerateProtocolAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = protocol.Id }, protocol);
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
