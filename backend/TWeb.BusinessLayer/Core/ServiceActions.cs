using TWeb.DataAccessLayer.Context;
using TWeb.Domain.Entities.Service;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Core;

public class ServiceActions
{
    protected ServiceActions() { }

    // -- SERVICE --
    protected List<ServiceDto> GetAllServiceActionExecution()
    {
        using var db = new ServiceContext();
        return db.Services.Select(MapServiceToDto).ToList();
    }

    protected List<ServiceDto> GetByProviderIdServiceActionExecution(string providerId)
    {
        using var db = new ServiceContext();
        return db.Services.Where(s => s.ProviderId == providerId).Select(MapServiceToDto).ToList();
    }

    protected ServiceDto? GetByIdServiceActionExecution(string id)
    {
        using var db = new ServiceContext();
        var s = db.Services.FirstOrDefault(x => x.Id == id);
        return s == null ? null : MapServiceToDto(s);
    }

    protected ServiceDto CreateServiceActionExecution(CreateServiceDto dto)
    {
        var entity = new Service
        {
            Id = Guid.NewGuid().ToString(),
            ProviderId = dto.ProviderId, Title = dto.Title,
            Description = dto.Description, Price = dto.Price,
            Duration = dto.Duration, BufferMinutes = dto.BufferMinutes,
            CategoryId = dto.CategoryId
        };
        
        using var db = new ServiceContext();
        db.Services.Add(entity);
        db.SaveChanges();

        return MapServiceToDto(entity);
    }

    protected ServiceDto? UpdateServiceActionExecution(string id, UpdateServiceDto dto)
    {
        using var db = new ServiceContext();
        var s = db.Services.FirstOrDefault(x => x.Id == id);
        if (s == null) return null;

        if (dto.Title != null) s.Title = dto.Title;
        if (dto.Description != null) s.Description = dto.Description;
        if (dto.Price.HasValue) s.Price = dto.Price.Value;
        if (dto.Duration.HasValue) s.Duration = dto.Duration.Value;
        if (dto.BufferMinutes.HasValue) s.BufferMinutes = dto.BufferMinutes;
        if (dto.CategoryId != null) s.CategoryId = dto.CategoryId;

        db.Services.Update(s);
        db.SaveChanges();

        return MapServiceToDto(s);
    }

    protected bool DeleteServiceActionExecution(string id)
    {
        using var db = new ServiceContext();
        var s = db.Services.FirstOrDefault(x => x.Id == id);
        if (s != null)
        {
            db.Services.Remove(s);
            db.SaveChanges();
            return true;
        }
        return false;
    }

    private static ServiceDto MapServiceToDto(Service s) => new()
    {
        Id = s.Id, ProviderId = s.ProviderId, Title = s.Title,
        Description = s.Description, Price = s.Price,
        Duration = s.Duration, BufferMinutes = s.BufferMinutes,
        CategoryId = s.CategoryId
    };


    // -- CATEGORY --
    protected List<CategoryDto> GetAllCategoryActionExecution()
    {
        using var db = new ServiceContext();
        return db.Categories.Select(MapCategoryToDto).ToList();
    }

    protected CategoryDto? GetByIdCategoryActionExecution(string id)
    {
        using var db = new ServiceContext();
        var cat = db.Categories.FirstOrDefault(x => x.Id == id);
        return cat == null ? null : MapCategoryToDto(cat);
    }

    protected CategoryDto CreateCategoryActionExecution(CreateCategoryDto dto)
    {
        var cat = new Category
        {
            Id = Guid.NewGuid().ToString(),
            Name = dto.Name, Icon = dto.Icon,
            Description = dto.Description, Color = dto.Color
        };
        
        using var db = new ServiceContext();
        db.Categories.Add(cat);
        db.SaveChanges();

        return MapCategoryToDto(cat);
    }

    protected CategoryDto? UpdateCategoryActionExecution(string id, UpdateCategoryDto dto)
    {
        using var db = new ServiceContext();
        var cat = db.Categories.FirstOrDefault(x => x.Id == id);
        if (cat == null) return null;

        if (dto.Name != null) cat.Name = dto.Name;
        if (dto.Icon != null) cat.Icon = dto.Icon;
        if (dto.Description != null) cat.Description = dto.Description;
        if (dto.Color != null) cat.Color = dto.Color;

        db.Categories.Update(cat);
        db.SaveChanges();

        return MapCategoryToDto(cat);
    }

    protected bool DeleteCategoryActionExecution(string id)
    {
        using var db = new ServiceContext();
        var cat = db.Categories.FirstOrDefault(x => x.Id == id);
        if (cat != null)
        {
            db.Categories.Remove(cat);
            db.SaveChanges();
            return true;
        }
        return false;
    }

    private static CategoryDto MapCategoryToDto(Category c) => new()
    {
        Id = c.Id, Name = c.Name, Icon = c.Icon,
        Description = c.Description, Color = c.Color
    };


    // -- REVIEW --
    protected List<ReviewDto> GetAllReviewActionExecution()
    {
        using var db = new ServiceContext();
        return db.Reviews.Select(MapReviewToDto).ToList();
    }

    protected List<ReviewDto> GetByProviderIdReviewActionExecution(string providerId)
    {
        using var db = new ServiceContext();
        return db.Reviews.Where(r => r.ProviderId == providerId).Select(MapReviewToDto).ToList();
    }

    protected ReviewDto CreateReviewActionExecution(CreateReviewDto dto)
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
        
        using var db = new ServiceContext();
        db.Reviews.Add(entity);
        db.SaveChanges();

        return MapReviewToDto(entity);
    }

    private static ReviewDto MapReviewToDto(Review r) => new()
    {
        Id = r.Id, BookingId = r.BookingId, ProviderId = r.ProviderId,
        UserId = r.UserId, Rating = r.Rating, Comment = r.Comment,
        CreatedAt = r.CreatedAt, UserName = r.UserName
    };
}

