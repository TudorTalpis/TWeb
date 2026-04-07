using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;

    public ServicesController(IServiceService serviceService)
    {
        _serviceService = serviceService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_serviceService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var s = _serviceService.GetById(id);
        if (s == null) return NotFound(new { message = $"Service {id} not found" });
        return Ok(s);
    }

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_serviceService.GetByProviderId(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateServiceDto dto)
    {
        var s = _serviceService.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = s.Id }, s);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateServiceDto dto)
    {
        var s = _serviceService.Update(id, dto);
        if (s == null) return NotFound(new { message = $"Service {id} not found" });
        return Ok(s);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_serviceService.Delete(id))
            return NotFound(new { message = $"Service {id} not found" });
        return NoContent();
    }
}
