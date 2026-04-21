using Microsoft.EntityFrameworkCore;
using TWeb.Domain.Entities.Booking;

namespace TWeb.DataAccessLayer.Context;

public class BookingContext : DbContext
{
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (DbSession.ConnectionString != null)
        {
            optionsBuilder.UseNpgsql(DbSession.ConnectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .Property(e => e.Status)
            .HasConversion(
                v => ((int)v).ToString(),
                v => Enum.Parse<TWeb.Domain.Enums.BookingStatus>(v));
    }
}
