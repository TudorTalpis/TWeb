namespace TWeb.Domain.Entities;

public class Availability
{
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public int Weekday { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int SlotMinutes { get; set; }
    public int BufferMinutes { get; set; }
}
