using backend.DTOs.Tts;

namespace backend.Services;

public interface ITtsService
{
    /// <summary>
    /// Synthesize Vietnamese text to speech.
    /// Returns the audio info (URL or Base64) and optional word timestamps.
    /// Returns null if synthesis fails.
    /// </summary>
    Task<TtsSynthesizeResponseDto?> SynthesizeAsync(string text, string voice = "banmai");
}
