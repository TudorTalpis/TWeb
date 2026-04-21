using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimeOffController : ControllerBase
{
    private readonly IProviderAction _timeOffService = new BusinessLogic().ProviderAction();

    public TimeOffController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_timeOffService.GetAllTimeOffAction());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_timeOffService.GetByProviderIdTimeOffAction(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateTimeOffDto dto)
    {
        var t = _timeOffService.CreateTimeOffAction(dto);
        return CreatedAtAction(nameof(GetAll), t);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_timeOffService.DeleteTimeOffAction(id))
            return NotFound(new { message = $"TimeOff {id} not found" });
        return NoContent();
    }
}


