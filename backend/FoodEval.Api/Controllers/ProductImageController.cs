using System.Security.Claims;
using FoodEval.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/org/products/{productId}/image")]
[Authorize]
public class ProductImageController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ProductImageController> _logger;

    public ProductImageController(
        IProductRepository productRepository,
        IWebHostEnvironment environment,
        ILogger<ProductImageController> logger)
    {
        _productRepository = productRepository;
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("upload")]
    [RequestFormLimits(MultipartBodyLengthLimit = 5242880)] // 5MB
    [DisableRequestSizeLimit]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<IActionResult> UploadProductImage(
        Guid productId,
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP" });
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 5MB limit" });
        }

        try
        {
            var product = await _productRepository.GetByIdAndOrganizationIdAsync(productId, organizationId, cancellationToken);
            if (product == null)
            {
                return NotFound(new { message = "Product not found or does not belong to your organization" });
            }

            // Create uploads directory if it doesn't exist
            var uploadsDir = Path.Combine(_environment.ContentRootPath, "uploads", "product-images");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            // Delete old product image if exists
            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                var oldRelativePath = product.ImageUrl.TrimStart('/');
                var oldFilePath = Path.Combine(_environment.ContentRootPath, oldRelativePath);
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete old product image: {Path}", oldFilePath);
                    }
                }
            }

            // Generate unique filename
            var fileName = $"{productId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);
            var relativePath = $"/uploads/product-images/{fileName}";

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            // Update product image URL
            product.ImageUrl = relativePath;
            await _productRepository.UpdateAsync(product, cancellationToken);

            return Ok(new { imageUrl = relativePath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading product image");
            return StatusCode(500, new { message = "An error occurred while uploading the image" });
        }
    }

    [HttpDelete]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    public async Task<IActionResult> DeleteProductImage(Guid productId, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        try
        {
            var product = await _productRepository.GetByIdAndOrganizationIdAsync(productId, organizationId, cancellationToken);
            if (product == null)
            {
                return NotFound(new { message = "Product not found or does not belong to your organization" });
            }

            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                var deleteRelativePath = product.ImageUrl.TrimStart('/');
                var deleteFilePath = Path.Combine(_environment.ContentRootPath, deleteRelativePath);
                if (System.IO.File.Exists(deleteFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(deleteFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete product image: {Path}", deleteFilePath);
                    }
                }

                product.ImageUrl = null;
                await _productRepository.UpdateAsync(product, cancellationToken);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product image");
            return StatusCode(500, new { message = "An error occurred while deleting the image" });
        }
    }
}
