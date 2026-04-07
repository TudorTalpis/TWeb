using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface INotificationService
{
    List<NotificationDto> GetAll();
    List<NotificationDto> GetByUserId(string userId);
    NotificationDto Create(CreateNotificationDto dto);
    bool MarkAsRead(string id);
    bool MarkAllAsRead(string userId);
}
