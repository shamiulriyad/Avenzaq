namespace Backend.DTOs.Admin;

public class AdminPromotionDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public DateTime StartAtUtc { get; set; }
    public DateTime EndAtUtc { get; set; }
    public decimal AmountPaid { get; set; }
    public bool IsActive { get; set; }
}
