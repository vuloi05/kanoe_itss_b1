using backend.DTOs.VoiceLab;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/voicelab")]
[EnableRateLimiting("VoiceLabPolicy")]
public class VoiceLabController : ControllerBase
{
    // Fallback user_id for anonymous requests (demo learner from seed_data.sql)
    private static readonly Guid FallbackUserId =
        Guid.Parse("a0000000-0000-0000-0000-000000000001");

    private readonly IAsrService _asrService;
    private readonly AzurePronunciationService _azureService;
    private readonly IVoiceScoringService _scoringService;
    private readonly VietImmerseDbContext _dbContext;
    private readonly ILogger<VoiceLabController> _logger;

    public VoiceLabController(
        IAsrService asrService,
        AzurePronunciationService azureService,
        IVoiceScoringService scoringService,
        VietImmerseDbContext dbContext,
        ILogger<VoiceLabController> logger)
    {
        _asrService = asrService;
        _azureService = azureService;
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

        // 1. Open read stream directly from IFormFile (Streaming, no RAM buffering)
        using var audioStream = request.AudioFile.OpenReadStream();

        _logger.LogInformation(
            "Voice Lab: received {Size} bytes (stream), expectedText='{Expected}', duration={Duration}s",
            request.AudioFile.Length, request.ExpectedText, request.DurationSeconds);

        string actualText;
        VoiceScoreResult scores;
        List<AssessmentWordDto>? assessmentWords = null;

        // Try Azure Pronunciation Assessment First
        var azureResult = await _azureService.EvaluateAsync(audioStream, request.ExpectedText);
        
        if (azureResult.Scores != null && !string.IsNullOrWhiteSpace(azureResult.ActualText))
        {
            _logger.LogInformation("Azure Speech Assessment successful.");
            actualText = azureResult.ActualText;
            scores = azureResult.Scores;
            assessmentWords = azureResult.Words;
        }
        else
        {
            // Reset stream position if Azure failed/unconfigured
            if (audioStream.CanSeek) audioStream.Position = 0;
            
            _logger.LogWarning("Azure Speech Assessment skipped or failed. Falling back to local pipeline (OpenAI -> FPT).");
            
            actualText = await _asrService.RecognizeAsync(audioStream, request.ExpectedText) ?? string.Empty;

            if (string.IsNullOrWhiteSpace(actualText))
            {
                _logger.LogWarning("ASR returned empty result — scoring with empty actual text");
            }

            scores = _scoringService.CalculateScores(
                request.ExpectedText, actualText, request.DurationSeconds);
        }

        // 4. Resolve user_id: from JWT if authenticated, fallback to demo user
        Guid? userId = null;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader.Substring(7).Trim();
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                if (handler.CanReadToken(token))
                {
                    var jwtToken = handler.ReadJwtToken(token);
                    userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                }
            }
        }

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
            SentenceId = request.SentenceId,
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
            Prosody = scores.Prosody,
            AssessmentWords = assessmentWords
        });
    }

    /// <summary>
    /// Retrieve the most recent pronunciation score for a specific sentence.
    /// Used by the frontend to render previous scores when re-selecting a completed dialogue line.
    /// </summary>
    [HttpGet("records/{sentenceId}")]
    [Authorize]
    public async Task<IActionResult> GetRecord(Guid sentenceId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var record = await _dbContext.VoiceLabRecords
            .AsNoTracking()
            .Where(r => r.UserId == userId && r.SentenceId == sentenceId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                ActualText = r.ActualText,
                Completeness = r.CompletenessScore ?? 0m,
                Accuracy = r.AccuracyScore ?? 0m,
                Fluency = r.FluencyScore ?? 0m,
                Prosody = r.ProsodyScore ?? 0m
            })
            .FirstOrDefaultAsync();

        if (record == null)
        {
            return NotFound(new { message = "Record not found" });
        }

        return Ok(record);
    }
}
