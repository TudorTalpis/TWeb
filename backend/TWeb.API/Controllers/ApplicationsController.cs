using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_applicationService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var a = _applicationService.GetById(id);
        if (a == null) return NotFound(new { message = $"Application {id} not found" });
        return Ok(a);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateApplicationDto dto)
    {
        var a = _applicationService.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = a.Id }, a);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateApplicationDto dto)
    {
        var a = _applicationService.Update(id, dto);
        if (a == null) return NotFound(new { message = $"Application {id} not found" });
        return Ok(a);
    }
}
