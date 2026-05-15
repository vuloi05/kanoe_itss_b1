namespace backend.Services;

public record PhotoUploadResult(string SecureUrl, string PublicId);

public interface IPhotoService
{
    Task<PhotoUploadResult> UploadAvatarAsync(IFormFile file);
    Task DeletePhotoAsync(string publicId);
}
