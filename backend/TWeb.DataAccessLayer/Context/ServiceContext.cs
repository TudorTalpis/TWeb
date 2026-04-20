using Microsoft.EntityFrameworkCore;
using TWeb.Domain.Entities.Service;

namespace TWeb.DataAccessLayer.Context;

public class ServiceContext : DbContext
{
    public DbSet<Category> Categories { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (DbSession.ConnectionString != null)
        {
            optionsBuilder.UseNpgsql(DbSession.ConnectionString);
        }
    }
}
