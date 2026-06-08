using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class OpenAiWhisperService : IAsrService
{
    private const string WhisperEndpoint = "https://api.openai.com/v1/audio/transcriptions";
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenAiWhisperService> _logger;

    public OpenAiWhisperService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<OpenAiWhisperService> logger)
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
            var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                ?? _configuration["OPENAI_API_KEY"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("OPENAI_API_KEY is not configured");
                return null;
            }

            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(45);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            using var content = new MultipartFormDataContent();

            // Add audio file content
            var fileContent = new StreamContent(audioStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
            content.Add(fileContent, "file", "audio.wav");

            // Add model parameter
            content.Add(new StringContent("whisper-1"), "model");

            // Add language parameter (force Vietnamese)
            content.Add(new StringContent("vi"), "language");

            // Add temperature = 0 to prevent hallucination
            content.Add(new StringContent("0"), "temperature");

            // Add prompt if provided (guarantees accurate transcription for low-context phrases)
            if (!string.IsNullOrWhiteSpace(prompt))
            {
                content.Add(new StringContent(prompt), "prompt");
                _logger.LogInformation("Whisper: using prompt hint '{Prompt}'", prompt);
            }

            _logger.LogInformation("Sending request to OpenAI Whisper API...");
            var response = await client.PostAsync(WhisperEndpoint, content);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("OpenAI Whisper returned HTTP {Status}: {Body}",
                    (int)response.StatusCode, json);
                return null;
            }

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.TryGetProperty("text", out var textProp))
            {
                var text = textProp.GetString();
                if (!string.IsNullOrEmpty(text))
                {
                    var cleanText = text.Trim();
                    _logger.LogInformation("Whisper recognized: {Text}", cleanText);
                    return cleanText;
                }
            }

            _logger.LogWarning("OpenAI Whisper: no 'text' field found in response");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI Whisper recognition failed");
            return null;
        }
    }
}
