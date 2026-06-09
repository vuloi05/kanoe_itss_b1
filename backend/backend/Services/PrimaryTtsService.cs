using backend.DTOs.Tts;

namespace backend.Services;

public class PrimaryTtsService : ITtsService
{
    private readonly AzureTtsService _azureTts;
    private readonly FptTtsService _fptTts;
    private readonly ILogger<PrimaryTtsService> _logger;

    public PrimaryTtsService(AzureTtsService azureTts, FptTtsService fptTts, ILogger<PrimaryTtsService> logger)
    {
        _azureTts = azureTts;
        _fptTts = fptTts;
        _logger = logger;
    }

    public async Task<TtsSynthesizeResponseDto?> SynthesizeAsync(string text, string voice = "banmai")
    {
        try
        {
            _logger.LogInformation("Attempting Azure TTS for text: {Text}", text.Length > 20 ? text[..20] + "..." : text);
            var result = await _azureTts.SynthesizeAsync(text, voice);
            
            if (result != null && (!string.IsNullOrEmpty(result.AudioBase64) || !string.IsNullOrEmpty(result.AudioUrl)))
            {
                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Azure TTS failed. Falling back to FPT.AI...");
        }

        _logger.LogInformation("Falling back to FPT.AI TTS...");
        return await _fptTts.SynthesizeAsync(text, voice);
    }
}
