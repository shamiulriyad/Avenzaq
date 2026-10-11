namespace Backend.Models.Entities;

public class Cart : BaseEntity
{
    public Guid CustomerId { get; set; }

    public User Customer { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
