using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Tts;

public class TtsSynthesizeRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Text { get; set; } = string.Empty;

    public string? Voice { get; set; }
}
