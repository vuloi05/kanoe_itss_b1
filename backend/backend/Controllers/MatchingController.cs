using backend.DTOs.Matching;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _matchingService;

    public MatchingController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out Guid userId))
            return userId;
        throw new UnauthorizedAccessException("Invalid user token");
    }

    /// <summary>
    /// Initiates a paid connection between the authenticated learner and a partner.
    /// Atomically deducts tokens, creates a conversation, and logs the transaction.
    /// POST /api/matching/connect
    /// </summary>
    [HttpPost("connect")]
    public async Task<IActionResult> Connect([FromBody] ConnectRequest request)
    {
        try
        {
            var learnerId = GetCurrentUserId();
            var result = await _matchingService.ProcessMatchingTransactionAsync(learnerId, request.PartnerId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // Covers: insufficient balance, duplicate transaction, role mismatch
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Returns the current token balance for the authenticated user.
    /// GET /api/matching/balance
    /// </summary>
    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        try
        {
            var userId = GetCurrentUserId();
            var balance = await _matchingService.GetTokenBalanceAsync(userId);
            return Ok(new TokenBalanceResponse { TokenBalance = balance });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Returns the token transaction history for the authenticated user.
    /// Includes both debits (as learner) and credits (as partner), newest first.
    /// GET /api/matching/transactions
    /// </summary>
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions()
    {
        try
        {
            var userId = GetCurrentUserId();
            var transactions = await _matchingService.GetTransactionHistoryAsync(userId);
            return Ok(transactions);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}