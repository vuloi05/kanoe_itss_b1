using backend.DTOs.Message;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Ensure user is authenticated
public class MessageController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessageController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out Guid userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Invalid user token");
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetCurrentUserId();
        var conversations = await _messageService.GetConversationsAsync(userId);
        return Ok(conversations);
    }

    [HttpGet("{conversationId}")]
    public async Task<IActionResult> GetMessages(Guid conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        // TODO: Could add check to ensure current user is part of conversation
        var messages = await _messageService.GetMessagesAsync(conversationId, page, pageSize);
        return Ok(messages);
    }

    [HttpPost("{conversationId}")]
    public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var message = await _messageService.SendMessageAsync(userId, conversationId, request.Content);
            return Ok(message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{conversationId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        var userId = GetCurrentUserId();
        await _messageService.MarkAsReadAsync(conversationId, userId);
        return NoContent();
    }
}
