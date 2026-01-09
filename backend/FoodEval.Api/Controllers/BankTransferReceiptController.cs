using System.Security.Claims;
using FoodEval.Application.Interfaces;
using FoodEval.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/org/prijave")]
[Authorize]
public class BankTransferReceiptController : ControllerBase
{
    private readonly IPrijavaService _prijavaService;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<BankTransferReceiptController> _logger;

    public BankTransferReceiptController(
        IPrijavaService prijavaService,
        IWebHostEnvironment environment,
        ILogger<BankTransferReceiptController> logger)
    {
        _prijavaService = prijavaService;
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("{id}/payments/bank-transfer/upload-receipt-file")]
    [Authorize(Roles = "OrganizationAdmin,OrganizationUser")]
    [RequestFormLimits(MultipartBodyLengthLimit = 10485760)] // 10MB
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadReceiptFile(Guid id, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
        
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim, out var organizationId))
            return BadRequest(new { message = "User does not belong to an organization" });

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file type (PDF, JPG, PNG)
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Invalid file type. Allowed types: PDF, JPG, JPEG, PNG" });
        }

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 10MB limit" });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsDir = Path.Combine(_environment.ContentRootPath, "uploads", "bank-receipts");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            // Generate unique filename
            var fileName = $"{id}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);
            var relativePath = $"/uploads/bank-receipts/{fileName}";

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            // Update prijava with receipt URL
            await _prijavaService.UploadBankTransferReceiptAsync(id, organizationId, relativePath, cancellationToken);

            return Ok(new { receiptUrl = relativePath });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading bank transfer receipt");
            return StatusCode(500, new { message = "An error occurred while uploading the receipt" });
        }
    }
}
