using Microsoft.Extensions.DependencyInjection;
using TWeb.BusinessLayer.Interfaces;
using TWeb.BusinessLayer.Services;

namespace TWeb.BusinessLayer;

public static class BusinessLogic
{
    public static IServiceCollection AddBusinessLogic(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProviderProfileService, ProviderProfileService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<ITimeOffService, TimeOffService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
