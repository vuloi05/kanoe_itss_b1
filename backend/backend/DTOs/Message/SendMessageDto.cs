using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Message;

public class SendMessageDto
{
    [Required]
    public string Content { get; set; } = string.Empty;
}
