namespace InfluencerAPI.DTOs;

// AUTH
public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    string UserId,
    string Email,
    string FullName,
    string Role
);

// DEALS
public record CreateDealRequest(
    string CreatorName,
    string ClientName,
    string CampaignName,
    string ContentType,
    string Currency,
    decimal TotalValue
);

public record UpdateDealRequest(
    string? CreatorName,
    string? ClientName,
    string? CampaignName,
    string? ContentType,
    string? Currency,
    decimal? TotalValue,
    string? Status,
    string? PublicationLink,
    DateTime? PublicationDate,
    string? Notes,
    bool? ApprovedToBill,
    bool? CreatorPaymentReceived,
    DateTime? CreatorPaymentDate,
    bool? CommissionReceived,
    DateTime? CommissionReceivedDate
);

public record DealFilters(
    string? CampaignName,
    string? CreatorName,
    string? ClientName,
    string? Status,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20
);

public record DealResponse(
    string Id,
    int DealNumber,
    string CreatorName,
    string ClientName,
    string CampaignName,
    string ContentType,
    string Currency,
    decimal TotalValue,
    decimal CreatorPayment,
    decimal Commission,
    string Status,
    string? PublicationLink,
    DateTime? PublicationDate,
    string? Notes,
    bool ApprovedToBill,
    bool CreatorPaymentReceived,
    DateTime? CreatorPaymentDate,
    bool CommissionReceived,
    DateTime? CommissionReceivedDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record PagedResponse<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

// DASHBOARD
public record DashboardResponse(
    int TotalActiveDeals,
    decimal TotalValueThisMonth,
    decimal TotalCommissionsThisMonth,
    decimal PendingCommissions,
    int TotalPublishedDeals,
    int TotalCancelledDeals,
    int DealsWithoutLink,
    int PendingApprovalToBill,
    int PendingCommissionCount
);
