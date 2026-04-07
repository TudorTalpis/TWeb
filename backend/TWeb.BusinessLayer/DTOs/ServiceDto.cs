namespace TWeb.BusinessLayer.DTOs;

public class ServiceDto
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

public class CreateServiceDto
{
    public string ProviderId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Price { get; set; }
    public int Duration { get; set; }
    public int? BufferMinutes { get; set; }
    public string CategoryId { get; set; } = string.Empty;
}

public class UpdateServiceDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public double? Price { get; set; }
    public int? Duration { get; set; }
    public int? BufferMinutes { get; set; }
    public string? CategoryId { get; set; }
}
