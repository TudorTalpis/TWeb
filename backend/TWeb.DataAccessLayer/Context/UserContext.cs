using Microsoft.EntityFrameworkCore;
using TWeb.Domain.Entities.User;

namespace TWeb.DataAccessLayer.Context;

public class UserContext : DbContext
{
    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<AppNotification> AppNotifications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (DbSession.ConnectionString != null)
        {
            optionsBuilder.UseNpgsql(DbSession.ConnectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>()
            .Property(e => e.Role)
            .HasConversion(
                v => ((int)v).ToString(),
                v => Enum.Parse<TWeb.Domain.Enums.Role>(v));

        modelBuilder.Entity<AppNotification>()
            .Property(e => e.Type)
            .HasConversion(
                v => ((int)v).ToString(),
                v => Enum.Parse<TWeb.Domain.Enums.NotificationType>(v));
    }
}
