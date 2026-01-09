namespace FoodEval.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid? SubcategoryId { get; set; }
    public string? SubcategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public string? ImageUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class CreateProductRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public Guid CategoryId { get; set; }

    public Guid? SubcategoryId { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(1000)]
    public string? Description { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(50)]
    public string? Unit { get; set; }

    public string? ImageUrl { get; set; }
}

public class UpdateProductRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public Guid CategoryId { get; set; }

    public Guid? SubcategoryId { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(1000)]
    public string? Description { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(50)]
    public string? Unit { get; set; }

    public string? ImageUrl { get; set; }
}
