namespace TWeb.BusinessLayer.DTOs;

public class ApplicationDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> CategoryIds { get; set; } = new();
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public List<string> GalleryPhotos { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public string? RejectReason { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateApplicationDto
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> CategoryIds { get; set; } = new();
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public List<string> GalleryPhotos { get; set; } = new();
}

public class UpdateApplicationDto
{
    public string Status { get; set; } = string.Empty;
    public string? RejectReason { get; set; }
}
