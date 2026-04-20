using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly IProviderAction _availabilityService = new BusinessLogic().ProviderAction();

    public AvailabilityController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_availabilityService.GetAllAvailabilityAction());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_availabilityService.GetByProviderIdAvailabilityAction(providerId));

    [HttpPut("provider/{providerId}")]
    public IActionResult SetForProvider(string providerId, [FromBody] List<AvailabilityDto> slots) =>
        Ok(_availabilityService.SetForProviderAvailabilityAction(providerId, slots));
}


