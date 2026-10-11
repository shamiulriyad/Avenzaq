namespace Backend.DTOs.Sellers;

public class RegisterSellerDto
{
    // Step 1: Shop Information
    public string ShopName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int EstablishedYear { get; set; }
    public string? Website { get; set; }

    // Step 2: Owner Information
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string OwnerPhone { get; set; } = string.Empty;
    public string? OwnerAddress { get; set; }
    public string OwnerIdType { get; set; } = "nid";
    public string? OwnerIdNumber { get; set; }

    // Step 3: Business Details
    public string BusinessType { get; set; } = "individual";
    public string? TaxId { get; set; }
    public string? BusinessLicense { get; set; }
    public string? BankAccountName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? BankBranch { get; set; }

    // Step 4: Business Policies
    public string ReturnPolicy { get; set; } = string.Empty;
    public string ShippingPolicy { get; set; } = string.Empty;
    public string ProcessingTime { get; set; } = "1-3";
    public bool AcceptsCOD { get; set; } = true;

    // Documents (File Uploads)
    public IFormFile? NidDocument { get; set; }
    public IFormFile? TradeLicenseFile { get; set; }
    public IFormFile? TinDocument { get; set; }
    public IFormFile? BankStatementFile { get; set; }
}
