using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace backend.Services;

/// <summary>
/// Translation service using Google Translate free API.
/// Detects Vietnamese vs Japanese and translates to the other language.
/// Gracefully returns null on any failure (spec: hide translation line, no error).
/// </summary>
public class TranslationService : ITranslationService
{
    private readonly ILogger<TranslationService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    
    // Regex to detect Japanese characters (Hiragana, Katakana, Kanji)
    private static readonly Regex JapaneseRegex = new(
        @"[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9F]",
        RegexOptions.Compiled);

    public TranslationService(ILogger<TranslationService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string?> TranslateAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        try
        {
            // Detect language direction
            var (sourceLang, targetLang) = DetectDirection(text);
            
            // Call Google Translate free API
            return await CallGoogleTranslateAsync(text, sourceLang, targetLang);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Translation failed for text: {TextPreview}", 
                text.Length > 50 ? text[..50] + "..." : text);
            return null;
        }
    }

    /// <summary>
    /// Detect if text is Japanese or Vietnamese based on character analysis.
    /// Returns (source, target) language codes for Google Translate.
    /// </summary>
    private static (string source, string target) DetectDirection(string text)
    {
        // Count Japanese characters
        var japaneseMatches = JapaneseRegex.Matches(text);
        var totalChars = text.Where(c => !char.IsWhiteSpace(c) && !char.IsPunctuation(c)).Count();
        
        if (totalChars == 0) return ("vi", "ja");
        
        var japaneseRatio = (double)japaneseMatches.Count / totalChars;
        
        // If >30% of non-whitespace chars are Japanese → treat as Japanese
        return japaneseRatio > 0.3 ? ("ja", "vi") : ("vi", "ja");
    }

    /// <summary>
    /// Call the free Google Translate API endpoint.
    /// </summary>
    private async Task<string?> CallGoogleTranslateAsync(string text, string sourceLang, string targetLang)
    {
        using var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(5);

        var encodedText = Uri.EscapeDataString(text);
        var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sourceLang}&tl={targetLang}&dt=t&q={encodedText}";
        
        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        // Response is a nested JSON array: [[["translated","original",...],...],...]
        var json = await response.Content.ReadAsStringAsync();
        
        // Parse the response - it's a nested array format
        // We need to extract all translated segments from the first element
        var result = System.Text.Json.JsonDocument.Parse(json);
        var root = result.RootElement;
        
        if (root.ValueKind != System.Text.Json.JsonValueKind.Array || root.GetArrayLength() == 0)
            return null;

        var sentences = root[0];
        if (sentences.ValueKind != System.Text.Json.JsonValueKind.Array)
            return null;

        var translatedParts = new List<string>();
        foreach (var sentence in sentences.EnumerateArray())
        {
            if (sentence.ValueKind == System.Text.Json.JsonValueKind.Array && sentence.GetArrayLength() > 0)
            {
                var part = sentence[0].GetString();
                if (!string.IsNullOrEmpty(part))
                    translatedParts.Add(part);
            }
        }

        var translated = string.Join("", translatedParts).Trim();
        return string.IsNullOrEmpty(translated) ? null : translated;
    }
}
