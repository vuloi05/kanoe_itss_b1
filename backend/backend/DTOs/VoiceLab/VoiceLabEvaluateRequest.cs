using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.DTOs.VoiceLab;

public class VoiceLabEvaluateRequest
{
    [Required]
    public IFormFile AudioFile { get; set; } = null!;

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string ExpectedText { get; set; } = string.Empty;

    [Required]
    [Range(0.1, 300.0)]
    public double DurationSeconds { get; set; }
}
