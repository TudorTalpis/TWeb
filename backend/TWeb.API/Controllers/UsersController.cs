using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserAction _userService = new BusinessLogic().UserAction();

    public UsersController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_userService.GetAllUserAction());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = _userService.GetUserByIdAction(id);
        if (user == null) return NotFound(new { message = $"User {id} not found" });
        return Ok(user);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateUserDto dto)
    {
        var user = _userService.UpdateUserAction(id, dto);
        if (user == null) return NotFound(new { message = $"User {id} not found" });
        return Ok(user);
    }
}


