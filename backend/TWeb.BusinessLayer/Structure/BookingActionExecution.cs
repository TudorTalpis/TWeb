using TWeb.BusinessLayer.Interfaces;
using TWeb.BusinessLayer.Core;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Structure;

public class BookingActionExecution : BookingActions, IBookingAction
{
    public BookingActionExecution() { }

    public List<BookingDto> GetAllBookingAction() => GetAllBookingActionExecution();
    
    public List<BookingDto> GetByUserIdBookingAction(string userId) => GetByUserIdBookingActionExecution(userId);
    
    public List<BookingDto> GetByProviderIdBookingAction(string providerId) => GetByProviderIdBookingActionExecution(providerId);
    
    public BookingDto? GetByIdBookingAction(string id) => GetByIdBookingActionExecution(id);
    
    public BookingDto? CreateBookingAction(CreateBookingDto dto) => CreateBookingActionExecution(dto);
    
    public BookingDto? UpdateBookingAction(string id, UpdateBookingDto dto) => UpdateBookingActionExecution(id, dto);
    
    public bool DeleteBookingAction(string id) => DeleteBookingActionExecution(id);
}

