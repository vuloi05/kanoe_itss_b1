using System.Text.Json;
using System.Text.RegularExpressions;

namespace backend.Services;

/// <summary>
/// FPT.AI Automatic Speech Recognition — converts audio to Vietnamese text.
/// Endpoint: POST https://api.fpt.ai/hmi/asr/general
/// </summary>
public class FptAsrService : IAsrService
{
    private const string FptAsrEndpoint = "https://api.fpt.ai/hmi/asr/general";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FptAsrService> _logger;

    public FptAsrService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<FptAsrService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string?> RecognizeAsync(Stream audioStream, string? prompt = null)
    {
        if (audioStream == null || audioStream.Length == 0)
            return null;

        try
        {
            var apiKey = Environment.GetEnvironmentVariable("FPT_ASR_API_KEY")
                ?? _configuration["FPT_ASR_API_KEY"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("FPT_ASR_API_KEY is not configured");
                return null;
            }

            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("api-key", apiKey);

            var content = new StreamContent(audioStream);
            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");

            var response = await client.PostAsync(FptAsrEndpoint, content);
            var json = await response.Content.ReadAsStringAsync();

            _logger.LogDebug("FPT ASR raw response: {Json}", json);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("FPT ASR returned HTTP {Status}: {Body}",
                    (int)response.StatusCode, json);
                return null;
            }

            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // FPT ASR response: { "hypotheses": [{ "utterance": "...", ... }], "status": 0 }
            if (root.TryGetProperty("hypotheses", out var hypotheses)
                && hypotheses.ValueKind == JsonValueKind.Array
                && hypotheses.GetArrayLength() > 0)
            {
                var first = hypotheses[0];
                if (first.TryGetProperty("utterance", out var utterance))
                {
                    var rawText = utterance.GetString();
                    if (!string.IsNullOrEmpty(rawText))
                    {
                        // Decode Unicode escape sequences (e.g. \u00e1 → á)
                        var decoded = Regex.Unescape(rawText);
                        _logger.LogInformation("FPT ASR recognized: {Text}", decoded);
                        return decoded.Trim();
                    }
                }
            }

            // Fallback: check if the response is still processing (async mode)
            if (root.TryGetProperty("status", out var status) && status.GetInt32() != 0)
            {
                _logger.LogWarning("FPT ASR returned non-zero status: {Status}", status.GetInt32());
            }

            _logger.LogWarning("FPT ASR: no utterance found in response");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FPT ASR recognition failed");
            return null;
        }
    }
}
