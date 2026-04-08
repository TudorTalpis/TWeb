using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_categoryService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var cat = _categoryService.GetById(id);
        if (cat == null) return NotFound(new { message = $"Category {id} not found" });
        return Ok(cat);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateCategoryDto dto)
    {
        var cat = _categoryService.Create(dto);
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, cat);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateCategoryDto dto)
    {
        var cat = _categoryService.Update(id, dto);
        if (cat == null) return NotFound(new { message = $"Category {id} not found" });
        return Ok(cat);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_categoryService.Delete(id))
            return NotFound(new { message = $"Category {id} not found" });
        return NoContent();
    }
}
