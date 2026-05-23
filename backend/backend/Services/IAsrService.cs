namespace backend.Services;

public interface IAsrService
{
    /// <summary>
    /// Send audio bytes to FPT ASR and return the recognized Vietnamese text.
    /// Returns null if recognition fails.
    /// </summary>
    Task<string?> RecognizeAsync(byte[] audioData);
}
