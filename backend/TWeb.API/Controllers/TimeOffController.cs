using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimeOffController : ControllerBase
{
    private readonly ITimeOffService _timeOffService;

    public TimeOffController(ITimeOffService timeOffService)
    {
        _timeOffService = timeOffService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_timeOffService.GetAll());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_timeOffService.GetByProviderId(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateTimeOffDto dto)
    {
        var t = _timeOffService.Create(dto);
        return CreatedAtAction(nameof(GetAll), t);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_timeOffService.Delete(id))
            return NotFound(new { message = $"TimeOff {id} not found" });
        return NoContent();
    }
}
