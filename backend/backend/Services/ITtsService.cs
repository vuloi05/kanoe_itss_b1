namespace backend.Services;

public interface ITtsService
{
    /// <summary>
    /// Synthesize Vietnamese text to speech and return the audio URL.
    /// Returns null if synthesis fails.
    /// </summary>
    Task<string?> SynthesizeAsync(string text);
}
