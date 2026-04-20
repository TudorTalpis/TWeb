using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Interfaces;

public interface IServiceAction
{
    // Service
    List<ServiceDto> GetAllServiceAction();
    List<ServiceDto> GetByProviderIdServiceAction(string providerId);
    ServiceDto? GetByIdServiceAction(string id);
    ServiceDto CreateServiceAction(CreateServiceDto dto);
    ServiceDto? UpdateServiceAction(string id, UpdateServiceDto dto);
    bool DeleteServiceAction(string id);

    // Category
    List<CategoryDto> GetAllCategoryAction();
    CategoryDto? GetByIdCategoryAction(string id);
    CategoryDto CreateCategoryAction(CreateCategoryDto dto);
    CategoryDto? UpdateCategoryAction(string id, UpdateCategoryDto dto);
    bool DeleteCategoryAction(string id);

    // Review
    List<ReviewDto> GetAllReviewAction();
    List<ReviewDto> GetByProviderIdReviewAction(string providerId);
    ReviewDto CreateReviewAction(CreateReviewDto dto);
}

