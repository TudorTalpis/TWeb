using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_notificationService.GetAll());

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId) =>
        Ok(_notificationService.GetByUserId(userId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateNotificationDto dto)
    {
        var n = _notificationService.Create(dto);
        return CreatedAtAction(nameof(GetAll), n);
    }

    [HttpPatch("{id}/read")]
    public IActionResult MarkAsRead(string id)
    {
        if (!_notificationService.MarkAsRead(id))
            return NotFound(new { message = $"Notification {id} not found" });
        return Ok(new { success = true });
    }

    [HttpPatch("user/{userId}/read-all")]
    public IActionResult MarkAllAsRead(string userId)
    {
        _notificationService.MarkAllAsRead(userId);
        return Ok(new { success = true });
    }
}
