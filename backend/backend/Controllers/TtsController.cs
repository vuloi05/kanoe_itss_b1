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

    public TtsController(ITtsService ttsService)
    {
        _ttsService = ttsService;
    }

    /// <summary>
    /// Synthesize Vietnamese text to speech via FPT.AI.
    /// Returns the audio URL (MP3) hosted on FPT's CDN.
    /// </summary>
    [HttpPost("synthesize")]
    public async Task<IActionResult> Synthesize([FromBody] TtsSynthesizeRequest request)
    {
        var audioUrl = await _ttsService.SynthesizeAsync(request.Text);

        if (string.IsNullOrEmpty(audioUrl))
            return StatusCode(502, new { message = "TTS synthesis failed. Please try again." });

        return Ok(new { audioUrl });
    }
}
