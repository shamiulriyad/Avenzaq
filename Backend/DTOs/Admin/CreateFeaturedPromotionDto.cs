namespace Backend.DTOs.Admin;

public class CreateFeaturedPromotionDto
{
    public Guid ProductId { get; set; }
    public DateTime StartAtUtc { get; set; }
    public DateTime EndAtUtc { get; set; }
    public decimal AmountPaid { get; set; }
}
