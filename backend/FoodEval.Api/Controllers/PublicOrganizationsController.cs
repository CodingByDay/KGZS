using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/public/organizations")]
[AllowAnonymous]
public class PublicOrganizationsController : ControllerBase
{
    private readonly IOrganizationService _service;

    public PublicOrganizationsController(IOrganizationService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterOrganizationResponse>> RegisterOrganization(
        [FromBody] RegisterOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _service.RegisterOrganizationAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
