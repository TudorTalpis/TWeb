using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IProviderAction _applicationService = new BusinessLogic().ProviderAction();

    public ApplicationsController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_applicationService.GetAllApplicationAction());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var a = _applicationService.GetByIdApplicationAction(id);
        if (a == null) return NotFound(new { message = $"Application {id} not found" });
        return Ok(a);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateApplicationDto dto)
    {
        var a = _applicationService.CreateApplicationAction(dto);
        return CreatedAtAction(nameof(GetById), new { id = a.Id }, a);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateApplicationDto dto)
    {
        var a = _applicationService.UpdateApplicationAction(id, dto);
        if (a == null) return NotFound(new { message = $"Application {id} not found" });
        return Ok(a);
    }
}


