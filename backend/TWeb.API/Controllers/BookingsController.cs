using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingAction _bookingService = new BusinessLogic().BookingAction();

    public BookingsController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_bookingService.GetAllBookingAction());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var b = _bookingService.GetByIdBookingAction(id);
        if (b == null) return NotFound(new { message = $"Booking {id} not found" });
        return Ok(b);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId) =>
        Ok(_bookingService.GetByUserIdBookingAction(userId));

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_bookingService.GetByProviderIdBookingAction(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateBookingDto dto)
    {
        var b = _bookingService.CreateBookingAction(dto);
        if (b == null) return Conflict(new { message = "Booking conflict or provider is blocked" });
        return CreatedAtAction(nameof(GetById), new { id = b.Id }, b);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateBookingDto dto)
    {
        var b = _bookingService.UpdateBookingAction(id, dto);
        if (b == null) return NotFound(new { message = $"Booking {id} not found" });
        return Ok(b);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_bookingService.DeleteBookingAction(id))
            return NotFound(new { message = $"Booking {id} not found" });
        return NoContent();
    }
}


