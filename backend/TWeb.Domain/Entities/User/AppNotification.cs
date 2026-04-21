using TWeb.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.User;

[Table("Notifications")]
public class AppNotification
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    public NotificationType Type { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public bool Read { get; set; }

    [DataType(DataType.DateTime)]
    public string CreatedAt { get; set; } = string.Empty;

    public string? LinkTo { get; set; }
}
