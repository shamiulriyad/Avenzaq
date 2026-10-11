namespace Backend.DTOs.Reviews;

public class CreateReviewDto
{
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
