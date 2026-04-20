using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly IProviderAction _providerService = new BusinessLogic().ProviderAction();

    public ProvidersController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_providerService.GetAllProviderProfileAction());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var p = _providerService.GetByIdProviderProfileAction(id);
        if (p == null) return NotFound(new { message = $"Provider {id} not found" });
        return Ok(p);
    }

    [HttpGet("slug/{slug}")]
    public IActionResult GetBySlug(string slug)
    {
        var p = _providerService.GetBySlugProviderProfileAction(slug);
        if (p == null) return NotFound(new { message = $"Provider with slug '{slug}' not found" });
        return Ok(p);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId)
    {
        var p = _providerService.GetByUserIdProviderProfileAction(userId);
        if (p == null) return NotFound(new { message = $"Provider for user {userId} not found" });
        return Ok(p);
    }

    [HttpPost]
    public IActionResult Create([FromBody] ProviderProfileDto dto)
    {
        var p = _providerService.CreateProviderProfileAction(dto);
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateProviderProfileDto dto)
    {
        var p = _providerService.UpdateProviderProfileAction(id, dto);
        if (p == null) return NotFound(new { message = $"Provider {id} not found" });
        return Ok(p);
    }

    [HttpPatch("{id}/featured")]
    public IActionResult ToggleFeatured(string id)
    {
        if (!_providerService.ToggleFeaturedProviderProfileAction(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetByIdProviderProfileAction(id));
    }

    [HttpPatch("{id}/sponsored")]
    public IActionResult ToggleSponsored(string id)
    {
        if (!_providerService.ToggleSponsoredProviderProfileAction(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetByIdProviderProfileAction(id));
    }

    [HttpPatch("{id}/blocked")]
    public IActionResult ToggleBlocked(string id)
    {
        if (!_providerService.ToggleBlockedProviderProfileAction(id))
            return NotFound(new { message = $"Provider {id} not found" });
        return Ok(_providerService.GetByIdProviderProfileAction(id));
    }
}


