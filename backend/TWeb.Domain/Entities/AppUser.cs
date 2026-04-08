using TWeb.Domain.Enums;

namespace TWeb.Domain.Entities;

public class AppUser
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.USER;
    public string? Avatar { get; set; }
}
