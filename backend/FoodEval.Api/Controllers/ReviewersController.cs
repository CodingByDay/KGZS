using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/admin/reviewers")]
[Authorize(Roles = "SuperAdmin")]
public class ReviewersController : ControllerBase
{
    private readonly IUserManagementService _service;

    public ReviewersController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReviewerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReviewerDto>>> GetReviewers(CancellationToken cancellationToken)
    {
        var reviewers = await _service.GetReviewersAsync(cancellationToken);
        return Ok(reviewers);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ReviewerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReviewerDto>> CreateReviewer([FromBody] CreateReviewerRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var created = await _service.CreateReviewerAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetReviewers), null, created);
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

    [HttpPut("{id}/email")]
    [ProducesResponseType(typeof(ReviewerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReviewerDto>> UpdateReviewerEmail(Guid id, [FromBody] UpdateReviewerEmailRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var updated = await _service.UpdateReviewerEmailAsync(id, request, cancellationToken);
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

    [HttpPost("{id}/reset-password")]
    [ProducesResponseType(typeof(ResetReviewerPasswordResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ResetReviewerPasswordResponse>> ResetReviewerPassword(Guid id, [FromBody] ResetReviewerPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _service.ResetReviewerPasswordAsync(id, request, cancellationToken);
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

    [HttpPut("{id}/profile")]
    [ProducesResponseType(typeof(ReviewerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReviewerDto>> UpdateReviewerProfile(Guid id, [FromBody] UpdateReviewerProfileRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var updated = await _service.UpdateReviewerProfileAsync(id, request, cancellationToken);
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> DeleteReviewer(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _service.DeleteReviewerAsync(id, cancellationToken);
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
}
