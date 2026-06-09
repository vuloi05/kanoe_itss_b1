using System.Web;
using backend.DTOs.Tts;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/tts")]
[Authorize]
public class TtsController : ControllerBase
{
    private readonly ITtsService _ttsService;
    private readonly IHttpClientFactory _httpClientFactory;

    public TtsController(ITtsService ttsService, IHttpClientFactory httpClientFactory)
    {
        _ttsService = ttsService;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Synthesize Vietnamese text to speech via FPT.AI.
    /// Returns the audio URL (MP3) hosted on FPT's CDN.
    /// </summary>
    [HttpPost("synthesize")]
    public async Task<IActionResult> Synthesize([FromBody] TtsSynthesizeRequest request)
    {
        var result = await _ttsService.SynthesizeAsync(request.Text, request.Voice ?? "banmai");

        if (result == null)
            return StatusCode(502, new { message = "TTS synthesis failed. Please try again." });

        return Ok(result);
    }

    /// <summary>
    /// Proxy endpoint — fetches audio from FPT CDN and streams it back.
    /// Bypasses CORS: FPT CDN doesn't set Access-Control-Allow-Origin,
    /// so browser fetch() is blocked. This proxy adds the header server-side.
    /// </summary>
    [HttpGet("audio")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAudio([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { message = "url query param is required." });

        // Only allow FPT CDN URLs
        if (!url.StartsWith("https://file01.fpt.ai/") && !url.StartsWith("https://file02.fpt.ai/"))
            return BadRequest(new { message = "Only FPT CDN audio URLs are allowed." });

        try
        {
            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();

            var stream = await response.Content.ReadAsStreamAsync();
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "audio/mpeg";

            Response.Headers["Access-Control-Allow-Origin"] = "*";

            return File(stream, contentType, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"Failed to proxy audio: {ex.Message}" });
        }
    }
}
