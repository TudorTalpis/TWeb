using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TWeb.Domain.Entities.Service;

[Table("Categories")]
public class Category
{
    [Key]
    public string Id { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [StringLength(50)]
    public string Color { get; set; } = string.Empty;
}
