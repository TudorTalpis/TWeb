using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_userService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = _userService.GetById(id);
        if (user == null) return NotFound(new { message = $"User {id} not found" });
        return Ok(user);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateUserDto dto)
    {
        var user = _userService.Update(id, dto);
        if (user == null) return NotFound(new { message = $"User {id} not found" });
        return Ok(user);
    }
}
