using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class ProviderProfileService : IProviderProfileService
{
    private readonly AppDbContext _db;

    public ProviderProfileService(AppDbContext db)
    {
        _db = db;
    }

    public List<ProviderProfileDto> GetAll() =>
        _db.ProviderProfiles.Select(p => MapToDto(p)).ToList();

    public ProviderProfileDto? GetById(string id)
    {
        var p = _db.ProviderProfiles.Find(id);
        return p == null ? null : MapToDto(p);
    }

    public ProviderProfileDto? GetBySlug(string slug)
    {
        var p = _db.ProviderProfiles.FirstOrDefault(x => x.Slug.ToLower() == slug.ToLower());
        return p == null ? null : MapToDto(p);
    }

    public ProviderProfileDto? GetByUserId(string userId)
    {
        var p = _db.ProviderProfiles.FirstOrDefault(x => x.UserId == userId);
        return p == null ? null : MapToDto(p);
    }

    public ProviderProfileDto Create(ProviderProfileDto dto)
    {
        var entity = new ProviderProfile
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            UserId = dto.UserId, Name = dto.Name, Slug = dto.Slug,
            Description = dto.Description, CategoryIds = dto.CategoryIds,
            PendingCategoryNames = dto.PendingCategoryNames,
            Avatar = dto.Avatar, CoverPhoto = dto.CoverPhoto,
            GalleryPhotos = dto.GalleryPhotos, Phone = dto.Phone,
            Location = dto.Location,
            DefaultServiceBufferMinutes = dto.DefaultServiceBufferMinutes,
            AutoConfirm = dto.AutoConfirm, Rating = dto.Rating,
            ReviewCount = dto.ReviewCount, Featured = dto.Featured,
            Sponsored = dto.Sponsored, Blocked = dto.Blocked
        };
        _db.ProviderProfiles.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public ProviderProfileDto? Update(string id, UpdateProviderProfileDto dto)
    {
        var p = _db.ProviderProfiles.Find(id);
        if (p == null) return null;

        if (dto.Name != null) p.Name = dto.Name;
        if (dto.Slug != null) p.Slug = dto.Slug;
        if (dto.Description != null) p.Description = dto.Description;
        if (dto.CategoryIds != null) p.CategoryIds = dto.CategoryIds;
        if (dto.PendingCategoryNames != null) p.PendingCategoryNames = dto.PendingCategoryNames;
        if (dto.Avatar != null) p.Avatar = dto.Avatar;
        if (dto.CoverPhoto != null) p.CoverPhoto = dto.CoverPhoto;
        if (dto.GalleryPhotos != null) p.GalleryPhotos = dto.GalleryPhotos;
        if (dto.Phone != null) p.Phone = dto.Phone;
        if (dto.Location != null) p.Location = dto.Location;
        if (dto.DefaultServiceBufferMinutes.HasValue) p.DefaultServiceBufferMinutes = dto.DefaultServiceBufferMinutes.Value;
        if (dto.AutoConfirm.HasValue) p.AutoConfirm = dto.AutoConfirm.Value;

        _db.SaveChanges();
        return MapToDto(p);
    }

    public bool ToggleFeatured(string id)
    {
        var p = _db.ProviderProfiles.Find(id);
        if (p == null) return false;
        p.Featured = !p.Featured;
        _db.SaveChanges();
        return true;
    }

    public bool ToggleSponsored(string id)
    {
        var p = _db.ProviderProfiles.Find(id);
        if (p == null) return false;
        p.Sponsored = !p.Sponsored;
        _db.SaveChanges();
        return true;
    }

    public bool ToggleBlocked(string id)
    {
        var p = _db.ProviderProfiles.Find(id);
        if (p == null) return false;
        p.Blocked = !p.Blocked;
        _db.SaveChanges();
        return true;
    }

    private static ProviderProfileDto MapToDto(ProviderProfile p) => new()
    {
        Id = p.Id, UserId = p.UserId, Name = p.Name, Slug = p.Slug,
        Description = p.Description, CategoryIds = p.CategoryIds,
        PendingCategoryNames = p.PendingCategoryNames,
        Avatar = p.Avatar, CoverPhoto = p.CoverPhoto,
        GalleryPhotos = p.GalleryPhotos, Phone = p.Phone,
        Location = p.Location,
        DefaultServiceBufferMinutes = p.DefaultServiceBufferMinutes,
        AutoConfirm = p.AutoConfirm, Rating = p.Rating,
        ReviewCount = p.ReviewCount, Featured = p.Featured,
        Sponsored = p.Sponsored, Blocked = p.Blocked
    };
}
