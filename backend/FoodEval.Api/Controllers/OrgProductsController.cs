using System.Security.Claims;
using FoodEval.Application.DTOs;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/org/products")]
[Authorize]
public class OrgProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public OrgProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? subcategoryId,
        CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        var products = await _productService.GetByOrganizationIdAsync(organizationId, search, categoryId, subcategoryId, cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        var product = await _productService.GetByIdAsync(id, organizationId, cancellationToken);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<ProductDto>> CreateProduct(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
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
            var created = await _productService.CreateAsync(organizationId, request, cancellationToken);
            return CreatedAtAction(nameof(GetProductById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(
        Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
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
            var updated = await _productService.UpdateAsync(id, organizationId, request, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<ActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            await _productService.DeleteAsync(id, organizationId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
