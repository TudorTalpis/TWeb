using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IAvailabilityService
{
    List<AvailabilityDto> GetAll();
    List<AvailabilityDto> GetByProviderId(string providerId);
    List<AvailabilityDto> SetForProvider(string providerId, List<AvailabilityDto> slots);
}
