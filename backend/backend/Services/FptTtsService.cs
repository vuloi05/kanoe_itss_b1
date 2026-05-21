using System.Text.Json;

namespace backend.Services;

/// <summary>
/// FPT.AI Text-to-Speech v5 integration.
/// Sends Vietnamese text and returns the hosted audio URL from FPT's CDN.
/// </summary>
public class FptTtsService : ITtsService
{
    private const string FptTtsEndpoint = "https://api.fpt.ai/hmi/tts/v5";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FptTtsService> _logger;

    public FptTtsService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<FptTtsService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string?> SynthesizeAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        try
        {
            var apiKey = Environment.GetEnvironmentVariable("FPT_TTS_API_KEY")
                ?? _configuration["FPT_TTS_API_KEY"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("FPT_TTS_API_KEY is not configured");
                return null;
            }

            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);

            client.DefaultRequestHeaders.Add("api-key", apiKey);
            client.DefaultRequestHeaders.Add("speed", "");
            client.DefaultRequestHeaders.Add("voice", "banmai");

            // FPT v5 expects raw text as the request body
            var content = new StringContent(text);

            var response = await client.PostAsync(FptTtsEndpoint, content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // FPT response: { "async": "https://...", "error": 0, "message": "...", "audiourl": "https://..." }
            if (root.TryGetProperty("error", out var errorProp) && errorProp.GetInt32() != 0)
            {
                var message = root.TryGetProperty("message", out var msgProp)
                    ? msgProp.GetString()
                    : "Unknown error";
                _logger.LogWarning("FPT TTS returned error {Error}: {Message}",
                    errorProp.GetInt32(), message);
                return null;
            }

            // Extract the audio URL from FPT's response
            string? audioUrl = null;

            if (root.TryGetProperty("async", out var asyncUrl) && asyncUrl.ValueKind == JsonValueKind.String)
            {
                var url = asyncUrl.GetString();
                if (!string.IsNullOrEmpty(url) && url.StartsWith("http"))
                    audioUrl = url;
            }

            if (audioUrl == null && root.TryGetProperty("audiourl", out var audioUrlProp))
            {
                audioUrl = audioUrlProp.GetString();
            }

            if (string.IsNullOrEmpty(audioUrl))
            {
                _logger.LogWarning("FPT TTS response missing audiourl. Response: {Json}", json);
                return null;
            }

            // FPT v5 generates audio asynchronously — the URL may not be ready yet.
            // Poll with HEAD requests until the file is available on CDN.
            await WaitForAudioReady(client, audioUrl);

            return audioUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FPT TTS synthesis failed for text: {TextPreview}",
                text.Length > 50 ? text[..50] + "..." : text);
            return null;
        }
    }

    /// <summary>
    /// Polls the FPT CDN until the audio file returns HTTP 200,
    /// ensuring the client won't receive a URL to a file that doesn't exist yet.
    /// </summary>
    private async Task WaitForAudioReady(HttpClient client, string audioUrl)
    {
        const int maxRetries = 10;
        const int delayMs = 500;

        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                var headResponse = await client.SendAsync(
                    new HttpRequestMessage(HttpMethod.Head, audioUrl));

                if (headResponse.IsSuccessStatusCode)
                {
                    _logger.LogDebug("Audio ready after {Attempts} poll(s): {Url}", i + 1, audioUrl);
                    return;
                }
            }
            catch
            {
                // Network hiccup during poll — continue retrying
            }

            await Task.Delay(delayMs);
        }

        _logger.LogWarning("Audio may not be ready after {MaxRetries} polls: {Url}", maxRetries, audioUrl);
    }
}
