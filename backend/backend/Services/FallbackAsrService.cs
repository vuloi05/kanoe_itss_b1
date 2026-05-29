namespace backend.Services;

/// <summary>
/// Composite ASR service: tries OpenAI Whisper first, falls back to FPT.AI ASR on failure.
/// </summary>
public class FallbackAsrService : IAsrService
{
    private readonly OpenAiWhisperService _whisper;
    private readonly FptAsrService _fpt;
    private readonly ILogger<FallbackAsrService> _logger;

    public FallbackAsrService(
        OpenAiWhisperService whisper,
        FptAsrService fpt,
        ILogger<FallbackAsrService> logger)
    {
        _whisper = whisper;
        _fpt = fpt;
        _logger = logger;
    }

    public async Task<string?> RecognizeAsync(byte[] audioData, string? prompt = null)
    {
        // Primary: OpenAI Whisper
        try
        {
            var result = await _whisper.RecognizeAsync(audioData, prompt);
            if (!string.IsNullOrWhiteSpace(result))
                return result;

            _logger.LogWarning("OpenAI Whisper returned empty — falling back to FPT ASR");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenAI Whisper threw exception — falling back to FPT ASR");
        }

        // Fallback: FPT.AI ASR
        try
        {
            var result = await _fpt.RecognizeAsync(audioData, prompt);
            if (!string.IsNullOrWhiteSpace(result))
            {
                _logger.LogInformation("FPT ASR fallback succeeded");
                return result;
            }

            _logger.LogWarning("FPT ASR fallback also returned empty");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FPT ASR fallback also failed");
        }

        return null;
    }
}
