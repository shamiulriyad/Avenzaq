namespace Backend.Models.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid CustomerId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;

    public Product Product { get; set; } = null!;
    public User Customer { get; set; } = null!;
}
