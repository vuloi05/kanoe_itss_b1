namespace backend.DTOs.VoiceLab;

public class VoiceLabEvaluateResponse
{
    public string? ActualText { get; set; }
    public double Completeness { get; set; }
    public double Accuracy { get; set; }
    public double Fluency { get; set; }
    public double Prosody { get; set; }
    public List<AssessmentWordDto>? AssessmentWords { get; set; }
}

public class AssessmentWordDto
{
    public string Word { get; set; } = string.Empty;
    public string ErrorType { get; set; } = "None"; // None, Omission, Insertion, Mispronunciation
}
