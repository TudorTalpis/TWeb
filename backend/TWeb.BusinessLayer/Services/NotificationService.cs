using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public List<NotificationDto> GetAll() =>
        _db.Notifications.Select(n => MapToDto(n)).ToList();

    public List<NotificationDto> GetByUserId(string userId) =>
        _db.Notifications.Where(n => n.UserId == userId).Select(n => MapToDto(n)).ToList();

    public NotificationDto Create(CreateNotificationDto dto)
    {
        var entity = new AppNotification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = dto.UserId,
            Type = Enum.TryParse<NotificationType>(dto.Type, out var t) ? t : NotificationType.booking_success,
            Title = dto.Title, Message = dto.Message,
            Read = false,
            CreatedAt = DateTime.UtcNow.ToString("o"),
            LinkTo = dto.LinkTo
        };
        _db.Notifications.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public bool MarkAsRead(string id)
    {
        var n = _db.Notifications.Find(id);
        if (n == null) return false;
        n.Read = true;
        _db.SaveChanges();
        return true;
    }

    public bool MarkAllAsRead(string userId)
    {
        var items = _db.Notifications.Where(n => n.UserId == userId).ToList();
        foreach (var n in items) n.Read = true;
        _db.SaveChanges();
        return items.Count > 0;
    }

    private static NotificationDto MapToDto(AppNotification n) => new()
    {
        Id = n.Id, UserId = n.UserId, Type = n.Type.ToString(),
        Title = n.Title, Message = n.Message, Read = n.Read,
        CreatedAt = n.CreatedAt, LinkTo = n.LinkTo
    };
}
