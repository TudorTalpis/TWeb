using TWeb.BusinessLayer.Interfaces;
using TWeb.BusinessLayer.Core;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Structure;

public class ServiceActionExecution : ServiceActions, IServiceAction
{
    public ServiceActionExecution() { }

    public List<ServiceDto> GetAllServiceAction() => GetAllServiceActionExecution();
    public List<ServiceDto> GetByProviderIdServiceAction(string providerId) => GetByProviderIdServiceActionExecution(providerId);
    public ServiceDto? GetByIdServiceAction(string id) => GetByIdServiceActionExecution(id);
    public ServiceDto CreateServiceAction(CreateServiceDto dto) => CreateServiceActionExecution(dto);
    public ServiceDto? UpdateServiceAction(string id, UpdateServiceDto dto) => UpdateServiceActionExecution(id, dto);
    public bool DeleteServiceAction(string id) => DeleteServiceActionExecution(id);

    public List<CategoryDto> GetAllCategoryAction() => GetAllCategoryActionExecution();
    public CategoryDto? GetByIdCategoryAction(string id) => GetByIdCategoryActionExecution(id);
    public CategoryDto CreateCategoryAction(CreateCategoryDto dto) => CreateCategoryActionExecution(dto);
    public CategoryDto? UpdateCategoryAction(string id, UpdateCategoryDto dto) => UpdateCategoryActionExecution(id, dto);
    public bool DeleteCategoryAction(string id) => DeleteCategoryActionExecution(id);

    public List<ReviewDto> GetAllReviewAction() => GetAllReviewActionExecution();
    public List<ReviewDto> GetByProviderIdReviewAction(string providerId) => GetByProviderIdReviewActionExecution(providerId);
    public ReviewDto CreateReviewAction(CreateReviewDto dto) => CreateReviewActionExecution(dto);
}

