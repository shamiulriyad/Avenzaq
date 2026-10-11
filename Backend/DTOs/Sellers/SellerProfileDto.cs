namespace Backend.DTOs.Sellers;

public class SellerProfileDto
{
    // Shop Information
    public string ShopName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int EstablishedYear { get; set; }
    public string? Website { get; set; }

    // Contact Information
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public string? OwnerAddress { get; set; }

    // Business Information
    public string? BusinessType { get; set; }
    public string? TaxId { get; set; }
    public string? BusinessLicense { get; set; }

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

    // Status
    public bool IsApproved { get; set; }
    public string? RejectionReason { get; set; }
}
