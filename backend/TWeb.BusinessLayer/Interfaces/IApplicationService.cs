using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IApplicationService
{
    List<ApplicationDto> GetAll();
    ApplicationDto? GetById(string id);
    ApplicationDto Create(CreateApplicationDto dto);
    ApplicationDto? Update(string id, UpdateApplicationDto dto);
}
