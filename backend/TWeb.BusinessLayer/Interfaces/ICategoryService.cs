using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface ICategoryService
{
    List<CategoryDto> GetAll();
    CategoryDto? GetById(string id);
    CategoryDto Create(CreateCategoryDto dto);
    CategoryDto? Update(string id, UpdateCategoryDto dto);
    bool Delete(string id);
}
