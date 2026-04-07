using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IReviewService
{
    List<ReviewDto> GetAll();
    List<ReviewDto> GetByProviderId(string providerId);
    ReviewDto Create(CreateReviewDto dto);
}
