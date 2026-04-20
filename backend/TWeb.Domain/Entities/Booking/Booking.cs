using TWeb.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Booking;

[Table("Bookings")]
public class Booking
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string ProviderId { get; set; } = string.Empty;

    [Required]
    public string ServiceId { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Date)]
    public string Date { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string EndTime { get; set; } = string.Empty;

    public BookingStatus Status { get; set; } = BookingStatus.PENDING;

    [DataType(DataType.DateTime)]
    public string CreatedAt { get; set; } = string.Empty;

    [StringLength(100)]
    public string UserName { get; set; } = string.Empty;

    [StringLength(30)]
    public string? UserPhone { get; set; }
}
