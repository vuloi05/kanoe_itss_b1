using System.Security.Claims;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public class RecordWordsRequest
{
    public List<string> Words { get; set; } = new();
}

[ApiController]
[Route("api/vocabularies")]
[Authorize]
public class VocabularyController : ControllerBase
{
    private readonly VietImmerseDbContext _db;
    private readonly ILogger<VocabularyController> _logger;

    public VocabularyController(VietImmerseDbContext db, ILogger<VocabularyController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Record learned vocabulary words for the current learner.
    /// Duplicates are silently skipped via application-layer filtering.
    /// </summary>
    [HttpPost("record")]
    public async Task<IActionResult> RecordLearnedWords([FromBody] RecordWordsRequest request)
    {
        if (request.Words.Count == 0)
            return Ok(new { recorded = 0, totalVocab = 0 });

        var userId = GetCurrentUserId();

        var profile = await _db.LearnerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            return NotFound(new { message = "Learner profile not found." });

        // Normalize: lowercase, trim, remove empty, deduplicate within the batch
        var normalizedWords = request.Words
            .Select(w => w.Trim().ToLowerInvariant())
            .Where(w => w.Length > 0)
            .Distinct()
            .ToList();

        if (normalizedWords.Count == 0)
            return Ok(new { recorded = 0, totalVocab = await CountVocab(profile.ProfileId) });

        // Query existing words to avoid UNIQUE constraint violations
        var existingWords = await _db.LearnerVocabularies
            .AsNoTracking()
            .Where(v => v.LearnerProfileId == profile.ProfileId && normalizedWords.Contains(v.Word))
            .Select(v => v.Word)
            .ToListAsync();

        var existingSet = new HashSet<string>(existingWords);
        var newWords = normalizedWords.Where(w => !existingSet.Contains(w)).ToList();

        if (newWords.Count > 0)
        {
            var entities = newWords.Select(w => new LearnerVocabulary
            {
                LearnerProfileId = profile.ProfileId,
                Word = w,
                LearnedAt = DateTime.UtcNow,
            });

            _db.LearnerVocabularies.AddRange(entities);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "User {UserId} recorded {Count} new vocab words",
                userId, newWords.Count);
        }

        var totalVocab = await CountVocab(profile.ProfileId);
        return Ok(new { recorded = newWords.Count, totalVocab });
    }

    private async Task<int> CountVocab(Guid profileId)
    {
        return await _db.LearnerVocabularies
            .CountAsync(v => v.LearnerProfileId == profileId);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Invalid token.");
        return Guid.Parse(claim.Value);
    }
}
