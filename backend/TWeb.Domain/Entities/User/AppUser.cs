using TWeb.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.User;

[Table("Users")]
public class AppUser
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = string.Empty;

    [StringLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public Role Role { get; set; } = Role.USER;

    public string? Avatar { get; set; }
}
