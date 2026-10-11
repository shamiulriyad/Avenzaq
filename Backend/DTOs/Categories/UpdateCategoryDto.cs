namespace Backend.DTOs.Categories;

/// <summary>
/// DTO for updating an existing category
/// </summary>
public class UpdateCategoryDto
{
    /// <summary>
    /// The category name (will be trimmed and validated for duplicates)
    /// </summary>
    public string Name { get; set; } = string.Empty;
}
