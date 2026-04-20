using TWeb.BusinessLayer.Interfaces;
using TWeb.BusinessLayer.Core;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Structure;

public class ProviderActionExecution : ProviderActions, IProviderAction
{
    public ProviderActionExecution() { }

    public List<ProviderProfileDto> GetAllProviderProfileAction() => GetAllProviderProfileActionExecution();
    public ProviderProfileDto? GetByIdProviderProfileAction(string id) => GetByIdProviderProfileActionExecution(id);
    public ProviderProfileDto? GetBySlugProviderProfileAction(string slug) => GetBySlugProviderProfileActionExecution(slug);
    public ProviderProfileDto? GetByUserIdProviderProfileAction(string userId) => GetByUserIdProviderProfileActionExecution(userId);
    public ProviderProfileDto CreateProviderProfileAction(ProviderProfileDto dto) => CreateProviderProfileActionExecution(dto);
    public ProviderProfileDto? UpdateProviderProfileAction(string id, UpdateProviderProfileDto dto) => UpdateProviderProfileActionExecution(id, dto);
    public bool ToggleFeaturedProviderProfileAction(string id) => ToggleFeaturedProviderProfileActionExecution(id);
    public bool ToggleSponsoredProviderProfileAction(string id) => ToggleSponsoredProviderProfileActionExecution(id);
    public bool ToggleBlockedProviderProfileAction(string id) => ToggleBlockedProviderProfileActionExecution(id);

    public List<ApplicationDto> GetAllApplicationAction() => GetAllApplicationActionExecution();
    public ApplicationDto? GetByIdApplicationAction(string id) => GetByIdApplicationActionExecution(id);
    public ApplicationDto CreateApplicationAction(CreateApplicationDto dto) => CreateApplicationActionExecution(dto);
    public ApplicationDto? UpdateApplicationAction(string id, UpdateApplicationDto dto) => UpdateApplicationActionExecution(id, dto);

    public List<AvailabilityDto> GetAllAvailabilityAction() => GetAllAvailabilityActionExecution();
    public List<AvailabilityDto> GetByProviderIdAvailabilityAction(string providerId) => GetByProviderIdAvailabilityActionExecution(providerId);
    public List<AvailabilityDto> SetForProviderAvailabilityAction(string providerId, List<AvailabilityDto> slots) => SetForProviderAvailabilityActionExecution(providerId, slots);

    public List<TimeOffDto> GetAllTimeOffAction() => GetAllTimeOffActionExecution();
    public List<TimeOffDto> GetByProviderIdTimeOffAction(string providerId) => GetByProviderIdTimeOffActionExecution(providerId);
    public TimeOffDto CreateTimeOffAction(CreateTimeOffDto dto) => CreateTimeOffActionExecution(dto);
    public bool DeleteTimeOffAction(string id) => DeleteTimeOffActionExecution(id);
}

