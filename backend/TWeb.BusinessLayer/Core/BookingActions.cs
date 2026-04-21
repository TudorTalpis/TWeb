using TWeb.DataAccessLayer.Context;
using TWeb.Domain.Entities.Booking;
using TWeb.Domain.Entities.Provider;
using TWeb.Domain.Models;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Core;

public class BookingActions
{
    protected BookingActions() { }

    protected List<BookingDto> GetAllBookingActionExecution()
    {
        using var db = new BookingContext();
        return db.Bookings.Select(MapToDto).ToList();
    }

    protected List<BookingDto> GetByUserIdBookingActionExecution(string userId)
    {
        using var db = new BookingContext();
        return db.Bookings.Where(b => b.UserId == userId).Select(MapToDto).ToList();
    }

    protected List<BookingDto> GetByProviderIdBookingActionExecution(string providerId)
    {
        using var db = new BookingContext();
        return db.Bookings.Where(b => b.ProviderId == providerId).Select(MapToDto).ToList();
    }

    protected BookingDto? GetByIdBookingActionExecution(string id)
    {
        using var db = new BookingContext();
        var b = db.Bookings.FirstOrDefault(x => x.Id == id);
        return b == null ? null : MapToDto(b);
    }

    protected BookingDto? CreateBookingActionExecution(CreateBookingDto dto)
    {
        ProviderProfile? provider = null;
        using (var dbProvider = new ProviderContext())
        {
            provider = dbProvider.ProviderProfiles.FirstOrDefault(p => p.Id == dto.ProviderId);
        }
        
        if (provider != null && provider.Blocked) return null;

        using var db = new BookingContext();
        var conflictCount = db.Bookings.Count(b => 
            b.ProviderId == dto.ProviderId && 
            b.Date == dto.Date && 
            b.Status != BookingStatus.CANCELLED && 
            b.StartTime == dto.StartTime);

        if (conflictCount > 0) return null;

        var entity = new Booking
        {
            Id = Guid.NewGuid().ToString(),
            UserId = dto.UserId, ProviderId = dto.ProviderId,
            ServiceId = dto.ServiceId, Date = dto.Date,
            StartTime = dto.StartTime, EndTime = dto.EndTime,
            Status = provider?.AutoConfirm == true ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
            CreatedAt = DateTime.UtcNow.ToString("o"),
            UserName = dto.UserName, UserPhone = dto.UserPhone
        };
        
        db.Bookings.Add(entity);
        db.SaveChanges();

        return MapToDto(entity);
    }

    protected BookingDto? UpdateBookingActionExecution(string id, UpdateBookingDto dto)
    {
        using var db = new BookingContext();
        var b = db.Bookings.FirstOrDefault(x => x.Id == id);
        if (b == null) return null;

        if (dto.Status != null && Enum.TryParse<BookingStatus>(dto.Status, out var status))
        {
            b.Status = status;
            db.Bookings.Update(b);
            db.SaveChanges();
        }

        return MapToDto(b);
    }

    protected bool DeleteBookingActionExecution(string id)
    {
        using var db = new BookingContext();
        var b = db.Bookings.FirstOrDefault(x => x.Id == id);
        if (b != null)
        {
            db.Bookings.Remove(b);
            db.SaveChanges();
            return true;
        }
        return false;
    }

    private static BookingDto MapToDto(Booking b) => new()
    {
        Id = b.Id, UserId = b.UserId, ProviderId = b.ProviderId,
        ServiceId = b.ServiceId, Date = b.Date,
        StartTime = b.StartTime, EndTime = b.EndTime,
        Status = b.Status.ToString(), CreatedAt = b.CreatedAt,
        UserName = b.UserName, UserPhone = b.UserPhone
    };
}

