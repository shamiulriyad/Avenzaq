using Backend.DTOs.Reviews;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;

namespace Backend.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<ReviewDto> CreateAsync(Guid customerId, CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            throw new InvalidOperationException("Rating should be between 1 and 5.");
        }

        var review = new Review
        {
            ProductId = dto.ProductId,
            CustomerId = customerId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        await _reviewRepository.AddAsync(review);
        await _reviewRepository.SaveChangesAsync();

        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAtUtc = review.CreatedAtUtc,
            CustomerName = "You"
        };
    }

    public async Task<List<ReviewDto>> GetByProductIdAsync(Guid productId)
    {
        var reviews = await _reviewRepository.GetByProductIdAsync(productId);
        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            CustomerName = r.Customer.FullName,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAtUtc = r.CreatedAtUtc
        }).ToList();
    }
}
