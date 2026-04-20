using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Interfaces;

public interface IProviderAction
{
    // ProviderProfile
    List<ProviderProfileDto> GetAllProviderProfileAction();
    ProviderProfileDto? GetByIdProviderProfileAction(string id);
    ProviderProfileDto? GetBySlugProviderProfileAction(string slug);
    ProviderProfileDto? GetByUserIdProviderProfileAction(string userId);
    ProviderProfileDto CreateProviderProfileAction(ProviderProfileDto dto);
    ProviderProfileDto? UpdateProviderProfileAction(string id, UpdateProviderProfileDto dto);
    bool ToggleFeaturedProviderProfileAction(string id);
    bool ToggleSponsoredProviderProfileAction(string id);
    bool ToggleBlockedProviderProfileAction(string id);

    // ProviderApplication
    List<ApplicationDto> GetAllApplicationAction();
    ApplicationDto? GetByIdApplicationAction(string id);
    ApplicationDto CreateApplicationAction(CreateApplicationDto dto);
    ApplicationDto? UpdateApplicationAction(string id, UpdateApplicationDto dto);

    // Availability
    List<AvailabilityDto> GetAllAvailabilityAction();
    List<AvailabilityDto> GetByProviderIdAvailabilityAction(string providerId);
    List<AvailabilityDto> SetForProviderAvailabilityAction(string providerId, List<AvailabilityDto> slots);

    // TimeOff
    List<TimeOffDto> GetAllTimeOffAction();
    List<TimeOffDto> GetByProviderIdTimeOffAction(string providerId);
    TimeOffDto CreateTimeOffAction(CreateTimeOffDto dto);
    bool DeleteTimeOffAction(string id);
}

