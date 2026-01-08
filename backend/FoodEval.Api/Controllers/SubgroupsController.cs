using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/subgroups")]
[Authorize]
public class SubgroupsController : ControllerBase
{
    private readonly ISubgroupService _service;

    public SubgroupsController(ISubgroupService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubgroupDto>>> GetAll([FromQuery] Guid? categoryId, CancellationToken cancellationToken)
    {
        var items = categoryId.HasValue
            ? await _service.GetByCategoryIdAsync(categoryId.Value, cancellationToken)
            : await _service.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubgroupDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<SubgroupDto>> Create([FromBody] CreateSubgroupRequest request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Organizer,Administrator,SuperAdmin")]
    public async Task<ActionResult<SubgroupDto>> Update(Guid id, [FromBody] UpdateSubgroupRequest request, CancellationToken cancellationToken)
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
}
