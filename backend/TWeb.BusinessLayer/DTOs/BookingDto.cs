namespace TWeb.BusinessLayer.DTOs;

public class BookingDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserPhone { get; set; }
}

public class CreateBookingDto
{
    public string UserId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserPhone { get; set; }
}

public class UpdateBookingDto
{
    public string? Status { get; set; }
}
