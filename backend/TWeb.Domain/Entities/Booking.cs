using TWeb.Domain.Enums;

namespace TWeb.Domain.Entities;

public class Booking
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public BookingStatus Status { get; set; } = BookingStatus.PENDING;
    public string CreatedAt { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserPhone { get; set; }
}
