using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Service;

[Table("Services")]
public class Service
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string ProviderId { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public double Price { get; set; }

    public int Duration { get; set; }

    public int? BufferMinutes { get; set; }

    [Required]
    public string CategoryId { get; set; } = string.Empty;
}
