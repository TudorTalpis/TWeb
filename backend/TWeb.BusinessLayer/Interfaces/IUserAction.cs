using TWeb.Domain.Models;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Interfaces;

public interface IUserAction
{
    List<UserDto> GetAllUserAction();
    UserDto? GetUserByIdAction(string id);
    LoginResponseDto? UserLoginAction(LoginRequestDto dto);
    UserDto UserSignUpAction(SignUpRequestDto dto);
    UserDto? UpdateUserAction(string id, UpdateUserDto dto);

    // Notification
    List<NotificationDto> GetAllNotificationAction();
    List<NotificationDto> GetByUserIdNotificationAction(string userId);
    NotificationDto CreateNotificationAction(CreateNotificationDto dto);
    bool MarkAsReadNotificationAction(string id);
    void MarkAllAsReadNotificationAction(string userId);
}

