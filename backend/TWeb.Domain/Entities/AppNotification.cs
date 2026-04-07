using TWeb.Domain.Enums;

namespace TWeb.Domain.Entities;

public class AppNotification
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? LinkTo { get; set; }
}
