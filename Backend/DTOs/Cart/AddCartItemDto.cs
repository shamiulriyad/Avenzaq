namespace Backend.DTOs.Cart;

public class AddCartItemDto
{
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
}
