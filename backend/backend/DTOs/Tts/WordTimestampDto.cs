namespace backend.DTOs.Tts;

public class WordTimestampDto
{
    public string Word { get; set; } = string.Empty;
    public double Start { get; set; }
    public double End { get; set; }
}
