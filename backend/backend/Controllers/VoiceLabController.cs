using backend.DTOs.VoiceLab;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/voicelab")]
public class VoiceLabController : ControllerBase
{
    // Fallback user_id for anonymous requests (demo learner from seed_data.sql)
    private static readonly Guid FallbackUserId =
        Guid.Parse("a0000000-0000-0000-0000-000000000001");

    private readonly IAsrService _asrService;
    private readonly IVoiceScoringService _scoringService;
    private readonly VietImmerseDbContext _dbContext;
    private readonly ILogger<VoiceLabController> _logger;

    public VoiceLabController(
        IAsrService asrService,
        IVoiceScoringService scoringService,
        VietImmerseDbContext dbContext,
        ILogger<VoiceLabController> logger)
    {
        _asrService = asrService;
        _scoringService = scoringService;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Evaluate pronunciation: ASR → Scoring → Save to DB → Return scores.
    /// [AllowAnonymous] for dev/test — switch to [Authorize] before production.
    /// </summary>
    [HttpPost("evaluate")]
    [AllowAnonymous]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB max audio upload
    public async Task<IActionResult> Evaluate([FromForm] VoiceLabEvaluateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 1. Read audio file into byte array
        byte[] audioBytes;
        await using (var ms = new MemoryStream())
        {
            await request.AudioFile.CopyToAsync(ms);
            audioBytes = ms.ToArray();
        }

        _logger.LogInformation(
            "Voice Lab: received {Size} bytes, expectedText='{Expected}', duration={Duration}s",
            audioBytes.Length, request.ExpectedText, request.DurationSeconds);

        // 2. Call ASR service to get recognized text (pass expected text as a prompt to guide Whisper)
        var actualText = await _asrService.RecognizeAsync(audioBytes, request.ExpectedText);

        if (string.IsNullOrWhiteSpace(actualText))
        {
            _logger.LogWarning("ASR returned empty result — scoring with empty actual text");
            actualText = string.Empty;
        }

        // 3. Calculate scores using real algorithms
        var scores = _scoringService.CalculateScores(
            request.ExpectedText, actualText, request.DurationSeconds);

        // 4. Resolve user_id: from JWT if authenticated, fallback to demo user
        Guid? userId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }
        else
        {
            userId = FallbackUserId;
        }

        // 5. Save to database
        var record = new VoiceLabRecord
        {
            RecordId = Guid.NewGuid(),
            UserId = userId,
            ExpectedText = request.ExpectedText,
            ActualText = actualText,
            CompletenessScore = (decimal)scores.Completeness,
            AccuracyScore = (decimal)scores.Accuracy,
            FluencyScore = (decimal)scores.Fluency,
            ProsodyScore = (decimal)scores.Prosody,
            AudioDuration = (decimal)request.DurationSeconds,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.VoiceLabRecords.Add(record);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Voice Lab saved: recordId={RecordId}, completeness={C}, accuracy={A}, fluency={F}, prosody={P}",
            record.RecordId, scores.Completeness, scores.Accuracy, scores.Fluency, scores.Prosody);

        // 6. Return response
        return Ok(new VoiceLabEvaluateResponse
        {
            ActualText = actualText,
            Completeness = scores.Completeness,
            Accuracy = scores.Accuracy,
            Fluency = scores.Fluency,
            Prosody = scores.Prosody
        });
    }
}
