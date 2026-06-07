using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly PayOSClient _payOSClient;
    private readonly IMemoryCache _cache;
    private readonly VietImmerseDbContext _dbContext;

    public PaymentController(PayOSClient payOSClient, IMemoryCache cache, VietImmerseDbContext dbContext)
    {
        _payOSClient = payOSClient;
        _cache = cache;
        _dbContext = dbContext;
    }

    [Authorize]
    [HttpPost("create-payment-link")]
    public async Task<IActionResult> CreatePaymentLink([FromBody] CreatePaymentLinkRequestDto request)
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { error = "Không tìm thấy thông tin người dùng." });
            }

            if (request.Tokens <= 0)
            {
                return BadRequest(new { error = "Số lượng token không hợp lệ." });
            }

            if (request.DiscountCode?.ToUpper() == "DOMIXI")
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(l => l.UserId == userId);
                if (user != null)
                {
                    user.TokenBalance += request.Tokens;
                    await _dbContext.SaveChangesAsync();
                    return Ok(new { isFree = true, message = "Áp dụng mã DOMIXI thành công!" });
                }
            }

            int amount = request.Tokens * 1000;
            // PayOS automatically prepends a prefix (like CSZXITR4HF8).
            // We set description to empty so that ONLY the prefix is shown.
            string description = "";
            
            // Generate a random order code (unique integer)
            long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmss") + new Random().Next(10, 99));

            // Cache the mapping between orderCode and userId for 30 minutes
            _cache.Set(orderCode, userId, TimeSpan.FromMinutes(30));

            // URL to redirect after payment completion or cancellation.
            string returnUrl = "http://localhost:3000/learner/wallet";
            string cancelUrl = "http://localhost:3000/learner/wallet";

            var item = new PaymentLinkItem { Name = $"Gói {request.Tokens} Tokens", Quantity = 1, Price = amount };
            var items = new List<PaymentLinkItem> { item };

            var paymentData = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = description,
                Items = items,
                CancelUrl = cancelUrl,
                ReturnUrl = returnUrl
            };

            var paymentRequests = new PayOS.Resources.V2.PaymentRequests.PaymentRequests(_payOSClient);
            CreatePaymentLinkResponse createPaymentResult = await paymentRequests.CreateAsync(paymentData);

            return Ok(new
            {
                checkoutUrl = createPaymentResult.CheckoutUrl,
                qrCode = createPaymentResult.QrCode,
                bin = createPaymentResult.Bin,
                accountNumber = createPaymentResult.AccountNumber,
                accountName = createPaymentResult.AccountName,
                amount = createPaymentResult.Amount,
                description = createPaymentResult.Description,
                orderCode = createPaymentResult.OrderCode
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> PayOSWebhook([FromBody] Webhook webhookBody)
    {
        try
        {
            // Verify signature
            var webhookData = await _payOSClient.Webhooks.VerifyAsync(webhookBody);

            if (webhookBody.Success)
            {
                long orderCode = webhookData.OrderCode;
                int amountPaid = (int)webhookData.Amount;
                int tokensEarned = amountPaid / 1000;

                if (_cache.TryGetValue(orderCode, out Guid userId))
                {
                    var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                    if (user != null)
                    {
                        user.TokenBalance += tokensEarned;
                        await _dbContext.SaveChangesAsync();
                        
                        // Remove from cache once processed
                        _cache.Remove(orderCode);
                    }
                }
            }

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            // Invalid signature or processing error
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

public class CreatePaymentLinkRequestDto
{
    public int Tokens { get; set; }
    public string Method { get; set; } = "bank_transfer";
    public string? DiscountCode { get; set; }
}
