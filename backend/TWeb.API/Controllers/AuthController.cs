using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto dto)
    {
        var result = _userService.Login(dto);
        if (result == null) return Unauthorized(new { message = "Invalid email or password" });
        return Ok(result);
    }

    [HttpPost("signup")]
    public IActionResult SignUp([FromBody] SignUpRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required" });

        var user = _userService.SignUp(dto);
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
