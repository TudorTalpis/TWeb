using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_availabilityService.GetAll());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_availabilityService.GetByProviderId(providerId));

    [HttpPut("provider/{providerId}")]
    public IActionResult SetForProvider(string providerId, [FromBody] List<AvailabilityDto> slots) =>
        Ok(_availabilityService.SetForProvider(providerId, slots));
}
