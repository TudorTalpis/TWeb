using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface ITimeOffService
{
    List<TimeOffDto> GetAll();
    List<TimeOffDto> GetByProviderId(string providerId);
    TimeOffDto Create(CreateTimeOffDto dto);
    bool Delete(string id);
}
