using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class ServiceService : IServiceService
{
    private readonly AppDbContext _db;

    public ServiceService(AppDbContext db)
    {
        _db = db;
    }

    public List<ServiceDto> GetAll() =>
        _db.Services.Select(s => MapToDto(s)).ToList();

    public List<ServiceDto> GetByProviderId(string providerId) =>
        _db.Services.Where(s => s.ProviderId == providerId).Select(s => MapToDto(s)).ToList();

    public ServiceDto? GetById(string id)
    {
        var s = _db.Services.Find(id);
        return s == null ? null : MapToDto(s);
    }

    public ServiceDto Create(CreateServiceDto dto)
    {
        var entity = new Service
        {
            Id = Guid.NewGuid().ToString(),
            ProviderId = dto.ProviderId, Title = dto.Title,
            Description = dto.Description, Price = dto.Price,
            Duration = dto.Duration, BufferMinutes = dto.BufferMinutes,
            CategoryId = dto.CategoryId
        };
        _db.Services.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public ServiceDto? Update(string id, UpdateServiceDto dto)
    {
        var s = _db.Services.Find(id);
        if (s == null) return null;

        if (dto.Title != null) s.Title = dto.Title;
        if (dto.Description != null) s.Description = dto.Description;
        if (dto.Price.HasValue) s.Price = dto.Price.Value;
        if (dto.Duration.HasValue) s.Duration = dto.Duration.Value;
        if (dto.BufferMinutes.HasValue) s.BufferMinutes = dto.BufferMinutes;
        if (dto.CategoryId != null) s.CategoryId = dto.CategoryId;

        _db.SaveChanges();
        return MapToDto(s);
    }

    public bool Delete(string id)
    {
        var s = _db.Services.Find(id);
        if (s == null) return false;
        _db.Services.Remove(s);
        _db.SaveChanges();
        return true;
    }

    private static ServiceDto MapToDto(Service s) => new()
    {
        Id = s.Id, ProviderId = s.ProviderId, Title = s.Title,
        Description = s.Description, Price = s.Price,
        Duration = s.Duration, BufferMinutes = s.BufferMinutes,
        CategoryId = s.CategoryId
    };
}
