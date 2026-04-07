using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_reviewService.GetAll());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_reviewService.GetByProviderId(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateReviewDto dto)
    {
        var r = _reviewService.Create(dto);
        return CreatedAtAction(nameof(GetAll), r);
    }
}
