using Backend.DTOs.Reviews;

namespace Backend.Interfaces.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(Guid customerId, CreateReviewDto dto);
    Task<List<ReviewDto>> GetByProductIdAsync(Guid productId);
}
