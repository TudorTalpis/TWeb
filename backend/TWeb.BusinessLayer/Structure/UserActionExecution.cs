using TWeb.BusinessLayer.Core;
using TWeb.BusinessLayer.Interfaces;
using TWeb.Domain.Models;

namespace TWeb.BusinessLayer.Structure;

public class UserActionExecution : UserActions, IUserAction
{
    public UserActionExecution() { }

    public List<UserDto> GetAllUserAction() => GetAllUserActionExecution();
    
    public UserDto? GetUserByIdAction(string id) => GetUserByIdActionExecution(id);
    
    public LoginResponseDto? UserLoginAction(LoginRequestDto dto) => UserLoginActionExecution(dto);
    
    public UserDto UserSignUpAction(SignUpRequestDto dto) => UserSignUpActionExecution(dto);
    
    public UserDto? UpdateUserAction(string id, UpdateUserDto dto) => UpdateUserActionExecution(id, dto);

    public List<NotificationDto> GetAllNotificationAction() => GetAllNotificationActionExecution();
    public List<NotificationDto> GetByUserIdNotificationAction(string userId) => GetByUserIdNotificationActionExecution(userId);
    public NotificationDto CreateNotificationAction(CreateNotificationDto dto) => CreateNotificationActionExecution(dto);
    public bool MarkAsReadNotificationAction(string id) => MarkAsReadNotificationActionExecution(id);
    public void MarkAllAsReadNotificationAction(string userId) => MarkAllAsReadNotificationActionExecution(userId);
}

