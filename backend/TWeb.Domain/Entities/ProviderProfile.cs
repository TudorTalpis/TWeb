namespace TWeb.Domain.Entities;

public class ProviderProfile
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> CategoryIds { get; set; } = new();
    public List<string> PendingCategoryNames { get; set; } = new();
    public string Avatar { get; set; } = string.Empty;
    public string CoverPhoto { get; set; } = string.Empty;
    public List<string> GalleryPhotos { get; set; } = new();
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int DefaultServiceBufferMinutes { get; set; }
    public bool AutoConfirm { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool Featured { get; set; }
    public bool Sponsored { get; set; }
    public bool Blocked { get; set; }
}
