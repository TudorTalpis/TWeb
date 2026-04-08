using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db)
    {
        _db = db;
    }

    public List<CategoryDto> GetAll() =>
        _db.Categories.Select(c => MapToDto(c)).ToList();

    public CategoryDto? GetById(string id)
    {
        var cat = _db.Categories.Find(id);
        return cat == null ? null : MapToDto(cat);
    }

    public CategoryDto Create(CreateCategoryDto dto)
    {
        var cat = new Category
        {
            Id = Guid.NewGuid().ToString(),
            Name = dto.Name, Icon = dto.Icon,
            Description = dto.Description, Color = dto.Color
        };
        _db.Categories.Add(cat);
        _db.SaveChanges();
        return MapToDto(cat);
    }

    public CategoryDto? Update(string id, UpdateCategoryDto dto)
    {
        var cat = _db.Categories.Find(id);
        if (cat == null) return null;

        if (dto.Name != null) cat.Name = dto.Name;
        if (dto.Icon != null) cat.Icon = dto.Icon;
        if (dto.Description != null) cat.Description = dto.Description;
        if (dto.Color != null) cat.Color = dto.Color;

        _db.SaveChanges();
        return MapToDto(cat);
    }

    public bool Delete(string id)
    {
        var cat = _db.Categories.Find(id);
        if (cat == null) return false;
        _db.Categories.Remove(cat);
        _db.SaveChanges();
        return true;
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id, Name = c.Name, Icon = c.Icon,
        Description = c.Description, Color = c.Color
    };
}
