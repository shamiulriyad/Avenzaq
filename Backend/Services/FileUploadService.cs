using Microsoft.AspNetCore.Http;

namespace Backend.Services;

public class FileUploadResult
{
    public string ImageUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
}

public interface IFileUploadService
{
    Task<FileUploadResult> UploadImageAsync(IFormFile file, string subfolder = "products");
    Task DeleteImageAsync(string fileName);
    bool ValidateImageFile(IFormFile file);
}

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public FileUploadService(IWebHostEnvironment env, IConfiguration config)
    {
        _env = env;
        _config = config;
    }

    public async Task<FileUploadResult> UploadImageAsync(IFormFile file, string subfolder = "products")
    {
        if (!ValidateImageFile(file))
            throw new InvalidOperationException("Invalid image file. Allowed formats: JPG, PNG, GIF, WEBP (Max 5MB)");

        // Create uploads directory if doesn't exist
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", subfolder);
        Directory.CreateDirectory(uploadsDir);

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return relative URL for accessing the image
        var imageUrl = $"/uploads/{subfolder}/{uniqueFileName}";

        return new FileUploadResult
        {
            ImageUrl = imageUrl,
            FileName = uniqueFileName,
            FilePath = filePath
        };
    }

    public async Task DeleteImageAsync(string fileName)
    {
        try
        {
            // Search in uploads folder recursively
            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
            var fileInfo = new DirectoryInfo(uploadsDir).GetFiles(fileName, SearchOption.AllDirectories).FirstOrDefault();

            if (fileInfo != null && fileInfo.Exists)
            {
                fileInfo.Delete();
                await Task.CompletedTask;
            }
        }
        catch (Exception ex)
        {
            // Log but don't throw - file might not exist
            Console.WriteLine($"Error deleting file {fileName}: {ex.Message}");
        }
    }

    public bool ValidateImageFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        if (file.Length > MaxFileSize)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return false;

        // Check MIME type
        var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedMimeTypes.Contains(file.ContentType?.ToLowerInvariant() ?? ""))
            return false;

        return true;
    }
}
