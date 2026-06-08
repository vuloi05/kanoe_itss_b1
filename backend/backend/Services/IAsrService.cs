namespace backend.Services;

public interface IAsrService
{
    /// <summary>
    /// Send audio bytes to ASR service and return the recognized Vietnamese text.
    /// </summary>
    Task<string?> RecognizeAsync(Stream audioStream, string? prompt = null);
}
