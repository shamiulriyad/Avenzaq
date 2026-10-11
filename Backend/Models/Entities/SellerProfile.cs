namespace Backend.Models.Entities;

public class SellerProfile : BaseEntity
{
    // User Reference
    public Guid UserId { get; set; }

    // Shop Information
    public string ShopName { get; set; } = string.Empty;
    public string ShopSlug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int EstablishedYear { get; set; }
    public string? Website { get; set; }

    // Contact Information
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public string? OwnerAddress { get; set; }

    // Verification Information
    public string? OwnerIdType { get; set; } = "nid";
    public string? OwnerIdNumber { get; set; }

    // Business Information
    public string? BusinessType { get; set; } = "individual";
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
    public bool IsApproved { get; set; }
    public bool IsRejected { get; set; } = false;
    public string? RejectionReason { get; set; }
    public decimal CommissionRate { get; set; } = 0.10m;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<SellerProduct> SellerProducts { get; set; } = new List<SellerProduct>();
    public ICollection<SellerOrder> SellerOrders { get; set; } = new List<SellerOrder>();
}
