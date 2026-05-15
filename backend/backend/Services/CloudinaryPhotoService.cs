using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace backend.Services;

public class CloudinaryPhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryPhotoService> _logger;

    // Max file size: 5 MB
    private const long MaxFileSize = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
    };

    public CloudinaryPhotoService(ILogger<CloudinaryPhotoService> logger)
    {
        _logger = logger;

        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME")
            ?? throw new InvalidOperationException("CLOUDINARY_CLOUD_NAME is not set.");
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY")
            ?? throw new InvalidOperationException("CLOUDINARY_API_KEY is not set.");
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
            ?? throw new InvalidOperationException("CLOUDINARY_API_SECRET is not set.");

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<PhotoUploadResult> UploadAvatarAsync(IFormFile file)
    {
        if (file.Length == 0)
            throw new ArgumentException("File is empty.");

        if (file.Length > MaxFileSize)
            throw new ArgumentException($"File size exceeds the {MaxFileSize / (1024 * 1024)}MB limit.");

        if (!AllowedContentTypes.Contains(file.ContentType))
            throw new ArgumentException($"Unsupported file type: {file.ContentType}. Allowed: jpg, png, webp.");

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "vietimmerse/avatars",
            // Crop to 500x500 square, auto-detect face as gravity anchor
            Transformation = new Transformation()
                .Width(500).Height(500)
                .Crop("fill").Gravity("face"),
            Overwrite = true,
            UniqueFilename = true,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
            throw new InvalidOperationException($"Upload failed: {result.Error.Message}");
        }

        _logger.LogInformation("Avatar uploaded: {PublicId} → {Url}", result.PublicId, result.SecureUrl);

        return new PhotoUploadResult(result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeletePhotoAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Result == "ok")
        {
            _logger.LogInformation("Cloudinary asset deleted: {PublicId}", publicId);
        }
        else
        {
            _logger.LogWarning("Cloudinary delete returned '{Result}' for {PublicId}", result.Result, publicId);
        }
    }

    /// <summary>
    /// Extract Cloudinary public_id from a secure URL.
    /// Example: "https://res.cloudinary.com/demo/image/upload/v123/vietimmerse/avatars/abc.jpg"
    ///       → "vietimmerse/avatars/abc"
    /// </summary>
    public static string? ExtractPublicId(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;

        try
        {
            var uri = new Uri(url);
            var segments = uri.AbsolutePath; // "/demo/image/upload/v123/folder/file.jpg"

            // Find the portion after "/upload/vXXX/" or "/upload/"
            const string uploadMarker = "/upload/";
            var uploadIdx = segments.IndexOf(uploadMarker, StringComparison.Ordinal);
            if (uploadIdx < 0)
                return null;

            var afterUpload = segments[(uploadIdx + uploadMarker.Length)..];

            // Skip version segment if present (e.g. "v1234567890/")
            if (afterUpload.StartsWith('v') && afterUpload.Contains('/'))
            {
                var firstSlash = afterUpload.IndexOf('/');
                // Only skip if the part before '/' is all digits (version number)
                if (afterUpload[1..firstSlash].All(char.IsDigit))
                    afterUpload = afterUpload[(firstSlash + 1)..];
            }

            // Remove file extension
            var dotIdx = afterUpload.LastIndexOf('.');
            return dotIdx > 0 ? afterUpload[..dotIdx] : afterUpload;
        }
        catch
        {
            return null;
        }
    }
}
