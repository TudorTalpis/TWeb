using Microsoft.EntityFrameworkCore;
using TWeb.Domain.Entities;

namespace TWeb.DataAccessLayer;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProviderProfile> ProviderProfiles => Set<ProviderProfile>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Availability> Availability => Set<Availability>();
    public DbSet<TimeOff> TimeOffs => Set<TimeOff>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<ProviderApplication> Applications => Set<ProviderApplication>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<AppNotification> Notifications => Set<AppNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // AppUser
        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Role).HasConversion<string>();
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // ProviderProfile
        modelBuilder.Entity<ProviderProfile>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.CategoryIds).HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()
            );
            e.Property(x => x.PendingCategoryNames).HasConversion(
                v => string.Join("||", v),
                v => v.Split("||", StringSplitOptions.RemoveEmptyEntries).ToList()
            );
            e.Property(x => x.GalleryPhotos).HasConversion(
                v => string.Join("||", v),
                v => v.Split("||", StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        });

        // Service
        modelBuilder.Entity<Service>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Availability
        modelBuilder.Entity<Availability>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // TimeOff
        modelBuilder.Entity<TimeOff>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Booking
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>();
        });

        // ProviderApplication
        modelBuilder.Entity<ProviderApplication>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.CategoryIds).HasConversion(
                v => string.Join(",", v),
                v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()
            );
            e.Property(x => x.GalleryPhotos).HasConversion(
                v => string.Join("||", v),
                v => v.Split("||", StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        });

        // Review
        modelBuilder.Entity<Review>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // AppNotification
        modelBuilder.Entity<AppNotification>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).HasConversion<string>();
        });
    }
}
