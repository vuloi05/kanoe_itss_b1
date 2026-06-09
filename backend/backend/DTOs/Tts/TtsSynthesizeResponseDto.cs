namespace backend.DTOs.Tts;

public class TtsSynthesizeResponseDto
{
    public string? AudioUrl { get; set; }
    public string? AudioBase64 { get; set; }
    public List<WordTimestampDto>? WordTimestamps { get; set; }
}
