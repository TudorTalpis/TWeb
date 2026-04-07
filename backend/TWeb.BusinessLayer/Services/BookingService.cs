using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    public List<BookingDto> GetAll() =>
        _db.Bookings.Select(b => MapToDto(b)).ToList();

    public List<BookingDto> GetByUserId(string userId) =>
        _db.Bookings.Where(b => b.UserId == userId).Select(b => MapToDto(b)).ToList();

    public List<BookingDto> GetByProviderId(string providerId) =>
        _db.Bookings.Where(b => b.ProviderId == providerId).Select(b => MapToDto(b)).ToList();

    public BookingDto? GetById(string id)
    {
        var b = _db.Bookings.Find(id);
        return b == null ? null : MapToDto(b);
    }

    public BookingDto? Create(CreateBookingDto dto)
    {
        var provider = _db.ProviderProfiles.Find(dto.ProviderId);
        if (provider != null && provider.Blocked) return null;

        var conflict = _db.Bookings.Any(b =>
            b.ProviderId == dto.ProviderId &&
            b.Date == dto.Date &&
            b.Status != BookingStatus.CANCELLED &&
            b.StartTime == dto.StartTime);
        if (conflict) return null;

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
        _db.Bookings.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public BookingDto? Update(string id, UpdateBookingDto dto)
    {
        var b = _db.Bookings.Find(id);
        if (b == null) return null;

        if (dto.Status != null && Enum.TryParse<BookingStatus>(dto.Status, out var status))
            b.Status = status;

        _db.SaveChanges();
        return MapToDto(b);
    }

    public bool Delete(string id)
    {
        var b = _db.Bookings.Find(id);
        if (b == null) return false;
        _db.Bookings.Remove(b);
        _db.SaveChanges();
        return true;
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
