using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Provider;

[Table("ProviderProfiles")]
public class ProviderProfile
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<string> CategoryIds { get; set; } = new();

    public List<string> PendingCategoryNames { get; set; } = new();

    public string Avatar { get; set; } = string.Empty;

    public string CoverPhoto { get; set; } = string.Empty;

    public List<string> GalleryPhotos { get; set; } = new();

    [StringLength(30)]
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
