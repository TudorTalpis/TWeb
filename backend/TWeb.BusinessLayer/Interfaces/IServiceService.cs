using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IServiceService
{
    List<ServiceDto> GetAll();
    List<ServiceDto> GetByProviderId(string providerId);
    ServiceDto? GetById(string id);
    ServiceDto Create(CreateServiceDto dto);
    ServiceDto? Update(string id, UpdateServiceDto dto);
    bool Delete(string id);
}
