using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Service;

[Table("Reviews")]
public class Review
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string BookingId { get; set; } = string.Empty;

    [Required]
    public string ProviderId { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    [DataType(DataType.DateTime)]
    public string CreatedAt { get; set; } = string.Empty;

    [StringLength(100)]
    public string UserName { get; set; } = string.Empty;
}
