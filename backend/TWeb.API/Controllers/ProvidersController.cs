using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly IProviderProfileService _providerService;

    public ProvidersController(IProviderProfileService providerService)
    {
        _providerService = providerService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_providerService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var p = _providerService.GetById(id);
        if (p == null) return NotFound(new { message = $"Provider {id} not found" });
        return Ok(p);
    }

    [HttpGet("slug/{slug}")]
    public IActionResult GetBySlug(string slug)
    {
        var p = _providerService.GetBySlug(slug);
        if (p == null) return NotFound(new { message = $"Provider with slug '{slug}' not found" });
        return Ok(p);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId)
    {
        var p = _providerService.GetByUserId(userId);
        if (p == null) return NotFound(new { message = $"Provider for user {userId} not found" });
        return Ok(p);
    }

    [HttpPost]
    public IActionResult Create([FromBody] ProviderProfileDto dto)
    {
        var p = _providerService.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateProviderProfileDto dto)
    {
        var p = _providerService.Update(id, dto);
        if (p == null) return NotFound(new { message = $"Provider {id} not found" });
        return Ok(p);
    }

    [HttpPatch("{id}/featured")]
    public IActionResult ToggleFeatured(string id)
    {
        if (!_providerService.ToggleFeatured(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetById(id));
    }

    [HttpPatch("{id}/sponsored")]
    public IActionResult ToggleSponsored(string id)
    {
        if (!_providerService.ToggleSponsored(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetById(id));
    }

    [HttpPatch("{id}/blocked")]
    public IActionResult ToggleBlocked(string id)
    {
        if (!_providerService.ToggleBlocked(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetById(id));
    }
}
