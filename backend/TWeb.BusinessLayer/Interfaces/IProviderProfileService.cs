using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IProviderProfileService
{
    List<ProviderProfileDto> GetAll();
    ProviderProfileDto? GetById(string id);
    ProviderProfileDto? GetBySlug(string slug);
    ProviderProfileDto? GetByUserId(string userId);
    ProviderProfileDto Create(ProviderProfileDto dto);
    ProviderProfileDto? Update(string id, UpdateProviderProfileDto dto);
    bool ToggleFeatured(string id);
    bool ToggleSponsored(string id);
    bool ToggleBlocked(string id);
}
