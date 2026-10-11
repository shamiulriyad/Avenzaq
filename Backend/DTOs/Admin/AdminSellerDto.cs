namespace Backend.DTOs.Admin;

public class AdminSellerDto
{
    public Guid Id { get; set; }

    // Shop Information
    public string ShopName { get; set; } = string.Empty;
    public string ShopSlug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int EstablishedYear { get; set; }
    public string? Website { get; set; }

    // Owner Information
    public string OwnerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }
    public string? OwnerAddress { get; set; }
    public string? OwnerEmail { get; set; }

    // Verification Information
    public string? OwnerIdType { get; set; }
    public string? OwnerIdNumber { get; set; }

    // Business Information
    public string? BusinessType { get; set; }
    public string? TaxId { get; set; }
    public string? BusinessLicense { get; set; }

    // Document URLs
    public string? NidDocumentUrl { get; set; }
    public string? TradeLicenseUrl { get; set; }
    public string? TinDocumentUrl { get; set; }
    public string? BankStatementUrl { get; set; }

    // Banking Information
    public string? BankAccountName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? BankBranch { get; set; }

    // Business Policies
    public string? ReturnPolicy { get; set; }
    public string? ShippingPolicy { get; set; }
    public string ProcessingTime { get; set; } = "1-3";
    public bool AcceptsCOD { get; set; } = true;

    // Shop Appearance
    public string? LogoUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? Location { get; set; }

    // Status
    public string Status { get; set; } = "pending";
    public bool Verified { get; set; }
    public bool IsRejected { get; set; }
    public string? RejectionReason { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal? Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}
