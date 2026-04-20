using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Provider;

[Table("TimeOffs")]
public class TimeOff
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string ProviderId { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Date)]
    public string Date { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string EndTime { get; set; } = string.Empty;

    public string? Reason { get; set; }
}
