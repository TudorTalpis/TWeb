using TWeb.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Provider;

[Table("Applications")]
public class ProviderApplication
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

    [StringLength(30)]
    public string Phone { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string Avatar { get; set; } = string.Empty;

    public List<string> GalleryPhotos { get; set; } = new();

    public ApplicationStatus Status { get; set; } = ApplicationStatus.PENDING;

    public string? RejectReason { get; set; }

    [DataType(DataType.DateTime)]
    public string CreatedAt { get; set; } = string.Empty;
}
