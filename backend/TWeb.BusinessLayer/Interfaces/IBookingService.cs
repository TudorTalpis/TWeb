using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IBookingService
{
    List<BookingDto> GetAll();
    List<BookingDto> GetByUserId(string userId);
    List<BookingDto> GetByProviderId(string providerId);
    BookingDto? GetById(string id);
    BookingDto? Create(CreateBookingDto dto);
    BookingDto? Update(string id, UpdateBookingDto dto);
    bool Delete(string id);
}
