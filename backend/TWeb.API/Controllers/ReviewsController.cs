using Microsoft.AspNetCore.Mvc;
using TWeb.BusinessLayer;
using TWeb.Domain.Models;

using TWeb.BusinessLayer.Interfaces;

namespace TWeb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IServiceAction _reviewService = new BusinessLogic().ServiceAction();

    public ReviewsController()
    {
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_reviewService.GetAllReviewAction());

    [HttpGet("provider/{providerId}")]
    public IActionResult GetByProviderId(string providerId) =>
        Ok(_reviewService.GetByProviderIdReviewAction(providerId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateReviewDto dto)
    {
        var r = _reviewService.CreateReviewAction(dto);
        return CreatedAtAction(nameof(GetAll), r);
    }
}


