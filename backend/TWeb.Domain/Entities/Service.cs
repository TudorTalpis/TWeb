namespace TWeb.Domain.Entities;

public class Service
{
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Price { get; set; }
    public int Duration { get; set; }
    public int? BufferMinutes { get; set; }
    public string CategoryId { get; set; } = string.Empty;
}
