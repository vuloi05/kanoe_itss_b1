namespace backend.Services;

public class VoiceScoreResult
{
    public double Completeness { get; set; }
    public double Accuracy { get; set; }
    public double Fluency { get; set; }
    public double Prosody { get; set; }
}

public interface IVoiceScoringService
{
    /// <summary>
    /// Calculate pronunciation scores by comparing expected vs actual text.
    /// All algorithms use real math (Levenshtein, tone analysis) — no Random.
    /// </summary>
    VoiceScoreResult CalculateScores(string expectedText, string actualText, double durationSeconds);
}
