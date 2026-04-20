using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Interfaces;

public interface IBookingAction
{
    List<BookingDto> GetAllBookingAction();
    List<BookingDto> GetByUserIdBookingAction(string userId);
    List<BookingDto> GetByProviderIdBookingAction(string providerId);
    BookingDto? GetByIdBookingAction(string id);
    BookingDto? CreateBookingAction(CreateBookingDto dto);
    BookingDto? UpdateBookingAction(string id, UpdateBookingDto dto);
    bool DeleteBookingAction(string id);
}

