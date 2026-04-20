using TWeb.DataAccessLayer.Context;
using TWeb.Domain.Entities.Provider;
using TWeb.Domain.Models;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Core;

public class ProviderActions
{
    protected ProviderActions() { }

    // -- ProviderProfile --
    protected List<ProviderProfileDto> GetAllProviderProfileActionExecution()
    {
        using var db = new ProviderContext();
        return db.ProviderProfiles.Select(MapProviderToDto).ToList();
    }

    protected ProviderProfileDto? GetByIdProviderProfileActionExecution(string id)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Id == id);
        return p == null ? null : MapProviderToDto(p);
    }

    protected ProviderProfileDto? GetBySlugProviderProfileActionExecution(string slug)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Slug.ToLower() == slug.ToLower());
        return p == null ? null : MapProviderToDto(p);
    }

    protected ProviderProfileDto? GetByUserIdProviderProfileActionExecution(string userId)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.UserId == userId);
        return p == null ? null : MapProviderToDto(p);
    }

    protected ProviderProfileDto CreateProviderProfileActionExecution(ProviderProfileDto dto)
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
        
        using var db = new ProviderContext();
        db.ProviderProfiles.Add(entity);
        db.SaveChanges();

        return MapProviderToDto(entity);
    }

    protected ProviderProfileDto? UpdateProviderProfileActionExecution(string id, UpdateProviderProfileDto dto)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Id == id);
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

        db.ProviderProfiles.Update(p);
        db.SaveChanges();

        return MapProviderToDto(p);
    }

    protected bool ToggleFeaturedProviderProfileActionExecution(string id)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Id == id);
        if (p == null) return false;
        p.Featured = !p.Featured;
        db.ProviderProfiles.Update(p);
        db.SaveChanges();
        return true;
    }

    protected bool ToggleSponsoredProviderProfileActionExecution(string id)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Id == id);
        if (p == null) return false;
        p.Sponsored = !p.Sponsored;
        db.ProviderProfiles.Update(p);
        db.SaveChanges();
        return true;
    }

    protected bool ToggleBlockedProviderProfileActionExecution(string id)
    {
        using var db = new ProviderContext();
        var p = db.ProviderProfiles.FirstOrDefault(x => x.Id == id);
        if (p == null) return false;
        p.Blocked = !p.Blocked;
        db.ProviderProfiles.Update(p);
        db.SaveChanges();
        return true;
    }

    private static ProviderProfileDto MapProviderToDto(ProviderProfile p) => new()
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


    // -- ProviderApplication --
    protected List<ApplicationDto> GetAllApplicationActionExecution()
    {
        using var db = new ProviderContext();
        return db.ProviderApplications.Select(MapAppToDto).ToList();
    }

    protected ApplicationDto? GetByIdApplicationActionExecution(string id)
    {
        using var db = new ProviderContext();
        var a = db.ProviderApplications.FirstOrDefault(x => x.Id == id);
        return a == null ? null : MapAppToDto(a);
    }

    protected ApplicationDto CreateApplicationActionExecution(CreateApplicationDto dto)
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
        
        using var db = new ProviderContext();
        db.ProviderApplications.Add(entity);
        db.SaveChanges();

        return MapAppToDto(entity);
    }

    protected ApplicationDto? UpdateApplicationActionExecution(string id, UpdateApplicationDto dto)
    {
        using var db = new ProviderContext();
        var a = db.ProviderApplications.FirstOrDefault(x => x.Id == id);
        if (a == null) return null;

        if (Enum.TryParse<ApplicationStatus>(dto.Status, out var status))
        {
            a.Status = status;
            a.RejectReason = status == ApplicationStatus.REJECTED ? dto.RejectReason : null;

            db.ProviderApplications.Update(a);
            db.SaveChanges();
        }

        return MapAppToDto(a);
    }

    private static ApplicationDto MapAppToDto(ProviderApplication a) => new()
    {
        Id = a.Id, UserId = a.UserId, Name = a.Name, Slug = a.Slug,
        Description = a.Description, CategoryIds = a.CategoryIds,
        Phone = a.Phone, Location = a.Location, Avatar = a.Avatar,
        GalleryPhotos = a.GalleryPhotos, Status = a.Status.ToString(),
        RejectReason = a.RejectReason, CreatedAt = a.CreatedAt
    };


    // -- Availability --
    protected List<AvailabilityDto> GetAllAvailabilityActionExecution()
    {
        using var db = new ProviderContext();
        return db.Availabilities.Select(MapAvailabilityToDto).ToList();
    }

    protected List<AvailabilityDto> GetByProviderIdAvailabilityActionExecution(string providerId)
    {
        using var db = new ProviderContext();
        return db.Availabilities.Where(x => x.ProviderId == providerId).Select(MapAvailabilityToDto).ToList();
    }

    protected List<AvailabilityDto> SetForProviderAvailabilityActionExecution(string providerId, List<AvailabilityDto> slots)
    {
        using var db = new ProviderContext();
        var existing = db.Availabilities.Where(x => x.ProviderId == providerId).ToList();
        db.Availabilities.RemoveRange(existing);

        var entities = slots.Select(slot => new Availability
        {
            Id = string.IsNullOrEmpty(slot.Id) ? Guid.NewGuid().ToString() : slot.Id,
            ProviderId = providerId,
            Weekday = slot.Weekday,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            SlotMinutes = slot.SlotMinutes,
            BufferMinutes = slot.BufferMinutes
        }).ToList();

        db.Availabilities.AddRange(entities);
        db.SaveChanges();

        return db.Availabilities.Where(x => x.ProviderId == providerId).Select(MapAvailabilityToDto).ToList();
    }

    private static AvailabilityDto MapAvailabilityToDto(Availability a) => new()
    {
        Id = a.Id, ProviderId = a.ProviderId, Weekday = a.Weekday,
        StartTime = a.StartTime, EndTime = a.EndTime,
        SlotMinutes = a.SlotMinutes, BufferMinutes = a.BufferMinutes
    };


    // -- TimeOff --
    protected List<TimeOffDto> GetAllTimeOffActionExecution()
    {
        using var db = new ProviderContext();
        return db.TimeOffs.Select(MapTimeOffToDto).ToList();
    }

    protected List<TimeOffDto> GetByProviderIdTimeOffActionExecution(string providerId)
    {
        using var db = new ProviderContext();
        return db.TimeOffs.Where(x => x.ProviderId == providerId).Select(MapTimeOffToDto).ToList();
    }

    protected TimeOffDto CreateTimeOffActionExecution(CreateTimeOffDto dto)
    {
        var entity = new TimeOff
        {
            Id = Guid.NewGuid().ToString(),
            ProviderId = dto.ProviderId,
            Date = dto.Date, StartTime = dto.StartTime,
            EndTime = dto.EndTime, Reason = dto.Reason
        };
        
        using var db = new ProviderContext();
        db.TimeOffs.Add(entity);
        db.SaveChanges();

        return MapTimeOffToDto(entity);
    }

    protected bool DeleteTimeOffActionExecution(string id)
    {
        using var db = new ProviderContext();
        var t = db.TimeOffs.FirstOrDefault(x => x.Id == id);
        if (t != null)
        {
            db.TimeOffs.Remove(t);
            db.SaveChanges();
            return true;
        }
        return false;
    }

    private static TimeOffDto MapTimeOffToDto(TimeOff t) => new()
    {
        Id = t.Id, ProviderId = t.ProviderId, Date = t.Date,
        StartTime = t.StartTime, EndTime = t.EndTime, Reason = t.Reason
    };
}

