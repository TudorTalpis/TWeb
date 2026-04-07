using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class TimeOffService : ITimeOffService
{
    private readonly AppDbContext _db;

    public TimeOffService(AppDbContext db)
    {
        _db = db;
    }

    public List<TimeOffDto> GetAll() =>
        _db.TimeOffs.Select(t => MapToDto(t)).ToList();

    public List<TimeOffDto> GetByProviderId(string providerId) =>
        _db.TimeOffs.Where(t => t.ProviderId == providerId).Select(t => MapToDto(t)).ToList();

    public TimeOffDto Create(CreateTimeOffDto dto)
    {
        var entity = new TimeOff
        {
            Id = Guid.NewGuid().ToString(),
            ProviderId = dto.ProviderId,
            Date = dto.Date, StartTime = dto.StartTime,
            EndTime = dto.EndTime, Reason = dto.Reason
        };
        _db.TimeOffs.Add(entity);
        _db.SaveChanges();
        return MapToDto(entity);
    }

    public bool Delete(string id)
    {
        var t = _db.TimeOffs.Find(id);
        if (t == null) return false;
        _db.TimeOffs.Remove(t);
        _db.SaveChanges();
        return true;
    }

    private static TimeOffDto MapToDto(TimeOff t) => new()
    {
        Id = t.Id, ProviderId = t.ProviderId, Date = t.Date,
        StartTime = t.StartTime, EndTime = t.EndTime, Reason = t.Reason
    };
}
