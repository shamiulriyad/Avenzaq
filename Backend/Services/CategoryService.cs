using Backend.DTOs.Categories;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(c => MapToDto(c)).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category != null ? MapToDto(category) : null;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        // Validation: Trim and validate input
        var name = dto.Name?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty.");

        if (name.Length < 2 || name.Length > 50)
            throw new ArgumentException("Category name must be between 2 and 50 characters.");

        // Check for duplicates (case-insensitive)
        var existingCategory = await _categoryRepository.GetByNameAsync(name);
        if (existingCategory != null)
            throw new InvalidOperationException($"A category with the name '{name}' already exists.");

        var slug = Slugify(name);

        // Verify slug is unique
        var existingSlug = await _categoryRepository.GetBySlugAsync(slug);
        if (existingSlug != null)
            throw new InvalidOperationException($"A category with the slug '{slug}' already exists.");

        var category = new Category
        {
            Name = name,
            Slug = slug
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return null;

        // Validation: Trim and validate input
        var name = dto.Name?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty.");

        if (name.Length < 2 || name.Length > 50)
            throw new ArgumentException("Category name must be between 2 and 50 characters.");

        // Check for duplicate name (excluding current category)
        var existingCategory = await _categoryRepository.GetByNameAsync(name);
        if (existingCategory != null && existingCategory.Id != id)
            throw new InvalidOperationException($"A category with the name '{name}' already exists.");

        // Re-slug if name changed
        var newSlug = Slugify(name);
        if (newSlug != category.Slug)
        {
            var existingSlug = await _categoryRepository.GetBySlugAsync(newSlug);
            if (existingSlug != null && existingSlug.Id != id)
                throw new InvalidOperationException($"A category with the slug '{newSlug}' already exists.");

            category.Slug = newSlug;
        }

        category.Name = name;
        _categoryRepository.Update(category);
        await _categoryRepository.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return false;

        // Prevent deletion if category has products
        // This would be checked by the database FK constraint anyway,
        // but we provide a custom error message here
        _categoryRepository.Remove(category);
        
        try
        {
            await _categoryRepository.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("FK_") == true)
        {
            throw new InvalidOperationException(
                "Cannot delete this category because it has products associated with it. " +
                "Please reassign or delete the products first.");
        }
    }

    // ─ Helpers ──────────────────────────────────────────────────────────────
    private static string Slugify(string input)
        => input.Trim()
                .ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("--", "-");

    private static CategoryDto MapToDto(Category category)
        => new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug
        };
}
