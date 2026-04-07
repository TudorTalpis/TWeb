using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Services;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _db;

    public ApplicationService(AppDbContext db)
    {
        _db = db;
    }

    public List<ApplicationDto> GetAll() =>
        _db.Applications.Select(a => MapToDto(a)).ToList();

    public ApplicationDto? GetById(string id)
    {
        var a = _db.Applications.Find(id);
        return a == null ? null : MapToDto(a);
    }

    public ApplicationDto Create(CreateApplicationDto dto)
    {
        var entity = new ProviderApplication
        {
            Id = Guid.NewGuid().ToString(),
            UserId = dto.UserId, Name = dto.Name, Slug = dto.Slug,
            Description = dto.Description, CategoryIds = dto.CategoryIds,
            Phone = dto.Phone, Location = dto.Location,
            Avatar = dto.Avatar, GalleryPhotos = dto.GalleryPhotos,
            Status = ApplicationStatus.PENDING,
            CreatedAt = DateTime.UtcNow.ToString("o")
        };
        _db.Applications.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public ApplicationDto? Update(string id, UpdateApplicationDto dto)
    {
        var a = _db.Applications.Find(id);
        if (a == null) return null;

        if (Enum.TryParse<ApplicationStatus>(dto.Status, out var status))
        {
            a.Status = status;
            a.RejectReason = status == ApplicationStatus.REJECTED ? dto.RejectReason : null;
        }

        _db.SaveChanges();
        return MapToDto(a);
    }

    private static ApplicationDto MapToDto(ProviderApplication a) => new()
    {
        Id = a.Id, UserId = a.UserId, Name = a.Name, Slug = a.Slug,
        Description = a.Description, CategoryIds = a.CategoryIds,
        Phone = a.Phone, Location = a.Location, Avatar = a.Avatar,
        GalleryPhotos = a.GalleryPhotos, Status = a.Status.ToString(),
        RejectReason = a.RejectReason, CreatedAt = a.CreatedAt
    };
}
