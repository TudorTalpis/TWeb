using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;

namespace TWeb.BusinessLayer.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly AppDbContext _db;

    public AvailabilityService(AppDbContext db)
    {
        _db = db;
    }

    public List<AvailabilityDto> GetAll() =>
        _db.Availability.Select(a => MapToDto(a)).ToList();

    public List<AvailabilityDto> GetByProviderId(string providerId) =>
        _db.Availability.Where(a => a.ProviderId == providerId).Select(a => MapToDto(a)).ToList();

    public List<AvailabilityDto> SetForProvider(string providerId, List<AvailabilityDto> slots)
    {
        var existing = _db.Availability.Where(a => a.ProviderId == providerId).ToList();
        _db.Availability.RemoveRange(existing);

        foreach (var slot in slots)
        {
            _db.Availability.Add(new Availability
            {
                Id = string.IsNullOrEmpty(slot.Id) ? Guid.NewGuid().ToString() : slot.Id,
                ProviderId = providerId,
                Weekday = slot.Weekday,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                SlotMinutes = slot.SlotMinutes,
                BufferMinutes = slot.BufferMinutes
            });
        }
        _db.SaveChanges();
        return GetByProviderId(providerId);
    }

    private static AvailabilityDto MapToDto(Availability a) => new()
    {
        Id = a.Id, ProviderId = a.ProviderId, Weekday = a.Weekday,
        StartTime = a.StartTime, EndTime = a.EndTime,
        SlotMinutes = a.SlotMinutes, BufferMinutes = a.BufferMinutes
    };
}
