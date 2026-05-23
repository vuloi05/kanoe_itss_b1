namespace backend.DTOs.VoiceLab;

public class VoiceLabEvaluateResponse
{
    public string? ActualText { get; set; }
    public double Completeness { get; set; }
    public double Accuracy { get; set; }
    public double Fluency { get; set; }
    public double Prosody { get; set; }
}
