using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_bookingService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var b = _bookingService.GetById(id);
        if (b == null) return NotFound(new { message = $"Booking {id} not found" });
        return Ok(b);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(string userId) =>
        Ok(_bookingService.GetByUserId(userId));

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_bookingService.GetByProviderId(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateBookingDto dto)
    {
        var b = _bookingService.Create(dto);
        if (b == null) return Conflict(new { message = "Booking conflict or provider is blocked" });
        return CreatedAtAction(nameof(GetById), new { id = b.Id }, b);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateBookingDto dto)
    {
        var b = _bookingService.Update(id, dto);
        if (b == null) return NotFound(new { message = $"Booking {id} not found" });
        return Ok(b);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_bookingService.Delete(id))
            return NotFound(new { message = $"Booking {id} not found" });
        return NoContent();
    }
}
