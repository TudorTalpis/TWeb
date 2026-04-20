namespace TWeb.Domain.Models;

public class TimeOffDto
{
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public class CreateTimeOffDto
{
    public string ProviderId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
