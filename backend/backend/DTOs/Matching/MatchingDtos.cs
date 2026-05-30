namespace backend.DTOs.Matching;

public class ConnectRequest
{
    public Guid PartnerId { get; set; }
}

public class ConnectResponse
{
    public Guid ConversationId { get; set; }
    public bool IsNew { get; set; }
    public int RemainingBalance { get; set; }
    public int AmountCharged { get; set; }
}

public class TokenBalanceResponse
{
    public int TokenBalance { get; set; }
}

public class TransactionHistoryDto
{
    public Guid Id { get; set; }

    /// <summary>"debit" when current user paid, "credit" when current user received</summary>
    public string Type { get; set; } = null!;

    /// <summary>Positive amount from the user's perspective (100 for debit, 70 for credit)</summary>
    public int Amount { get; set; }

    /// <summary>Display name of the counterparty</summary>
    public string CounterpartyName { get; set; } = null!;

    /// <summary>Avatar URL of the counterparty (for richer UI)</summary>
    public string? CounterpartyAvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; }
}
