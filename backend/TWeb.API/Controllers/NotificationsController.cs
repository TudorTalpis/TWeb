using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IUserAction _notificationService = new BusinessLogic().UserAction();

    public NotificationsController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_notificationService.GetAllNotificationAction());

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId) =>
        Ok(_notificationService.GetByUserIdNotificationAction(userId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateNotificationDto dto)
    {
        var n = _notificationService.CreateNotificationAction(dto);
        return CreatedAtAction(nameof(GetAll), n);
    }

    [HttpPatch("{id}/read")]
    public IActionResult MarkAsRead(string id)
    {
        if (!_notificationService.MarkAsReadNotificationAction(id))
            return NotFound(new { message = $"Notification {id} not found" });
        return Ok(new { success = true });
    }

    [HttpPatch("user/{userId}/read-all")]
    public IActionResult MarkAllAsRead(string userId)
    {
        _notificationService.MarkAllAsReadNotificationAction(userId);
        return Ok(new { success = true });
    }
}

