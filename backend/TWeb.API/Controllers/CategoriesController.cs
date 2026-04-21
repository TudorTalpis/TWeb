using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IServiceAction _categoryService = new BusinessLogic().ServiceAction();

    public CategoriesController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_categoryService.GetAllCategoryAction());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var cat = _categoryService.GetByIdCategoryAction(id);
        if (cat == null) return NotFound(new { message = $"Category {id} not found" });
        return Ok(cat);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateCategoryDto dto)
    {
        var cat = _categoryService.CreateCategoryAction(dto);
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, cat);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateCategoryDto dto)
    {
        var cat = _categoryService.UpdateCategoryAction(id, dto);
        if (cat == null) return NotFound(new { message = $"Category {id} not found" });
        return Ok(cat);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_categoryService.DeleteCategoryAction(id))
            return NotFound(new { message = $"Category {id} not found" });
        return NoContent();
    }
}


