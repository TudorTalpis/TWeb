namespace TWeb.Domain.Models;

public class ReviewDto
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

public class CreateReviewDto
{
    public string BookingId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}
