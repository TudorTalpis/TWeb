using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public List<ReviewDto> GetAll() =>
        _db.Reviews.Select(r => MapToDto(r)).ToList();

    public List<ReviewDto> GetByProviderId(string providerId) =>
        _db.Reviews.Where(r => r.ProviderId == providerId).Select(r => MapToDto(r)).ToList();

    public ReviewDto Create(CreateReviewDto dto)
    {
        var entity = new Review
        {
            Id = Guid.NewGuid().ToString(),
            BookingId = dto.BookingId, ProviderId = dto.ProviderId,
            UserId = dto.UserId, Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow.ToString("o"),
            UserName = dto.UserName
        };
        _db.Reviews.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    private static ReviewDto MapToDto(Review r) => new()
    {
        Id = r.Id, BookingId = r.BookingId, ProviderId = r.ProviderId,
        UserId = r.UserId, Rating = r.Rating, Comment = r.Comment,
        CreatedAt = r.CreatedAt, UserName = r.UserName
    };
}
