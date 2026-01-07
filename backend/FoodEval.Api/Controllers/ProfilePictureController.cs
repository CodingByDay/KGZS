using System.Security.Claims;
using FoodEval.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;

namespace FoodEval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilePictureController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ProfilePictureController> _logger;

    public ProfilePictureController(
        IUserRepository userRepository,
        IWebHostEnvironment environment,
        ILogger<ProfilePictureController> logger)
    {
        _userRepository = userRepository;
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("upload")]
    [RequestFormLimits(MultipartBodyLengthLimit = 5242880)] // 5MB
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

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
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return Unauthorized();
            }

            // Create uploads directory if it doesn't exist
            // Use ContentRootPath to ensure we have a consistent location
            var uploadsDir = Path.Combine(_environment.ContentRootPath, "uploads", "profile-pictures");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            // Delete old profile picture if exists
            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                // Remove leading slash and handle path correctly
                var oldRelativePath = user.ProfilePictureUrl.TrimStart('/');
                var oldFilePath = Path.Combine(_environment.ContentRootPath, oldRelativePath);
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete old profile picture: {Path}", oldFilePath);
                    }
                }
            }

            // Generate unique filename
            var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);
            var relativePath = $"/uploads/profile-pictures/{fileName}";

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            // Update user profile picture URL
            user.ProfilePictureUrl = relativePath;
            await _userRepository.UpdateAsync(user, cancellationToken);

            return Ok(new { profilePictureUrl = relativePath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile picture for user {UserId}: {ErrorMessage}", userId, ex.Message);
            return StatusCode(500, new { message = $"Failed to upload profile picture: {ex.Message}" });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteProfilePicture(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return Unauthorized();
            }

            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                // Remove leading slash and handle path correctly
                var deleteRelativePath = user.ProfilePictureUrl.TrimStart('/');
                var filePath = Path.Combine(_environment.ContentRootPath, deleteRelativePath);
                if (System.IO.File.Exists(filePath))
                {
                    try
                    {
                        System.IO.File.Delete(filePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete profile picture: {Path}", filePath);
                    }
                }

                user.ProfilePictureUrl = null;
                await _userRepository.UpdateAsync(user, cancellationToken);
            }

            return Ok(new { message = "Profile picture deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting profile picture for user {UserId}", userId);
            return StatusCode(500, new { message = "Failed to delete profile picture" });
        }
    }
}
