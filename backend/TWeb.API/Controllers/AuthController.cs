using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserAction _userService = new BusinessLogic().UserAction();

    public AuthController()
    {
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto dto)
    {
        var result = _userService.UserLoginAction(dto);
        if (result == null) return Unauthorized(new { message = "Invalid email or password" });
        return Ok(result);
    }

    [HttpPost("signup")]
    public IActionResult SignUp([FromBody] SignUpRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required" });

        var user = _userService.UserSignUpAction(dto);
        return Ok(new LoginResponseDto
        {
            Token = $"mock-jwt-{user.Id}-{DateTime.UtcNow.Ticks}",
            UserId = user.Id,
            Role = user.Role,
            Name = user.Name,
            Email = user.Email
        });
    }
}


