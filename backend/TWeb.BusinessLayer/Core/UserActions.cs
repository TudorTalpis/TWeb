using TWeb.DataAccessLayer.Context;
using TWeb.Domain.Entities.User;
using TWeb.Domain.Models;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Core;

public class UserActions
{
    protected UserActions() { }

    protected List<UserDto> GetAllUserActionExecution()
    {
        using var db = new UserContext();
        var users = db.AppUsers.ToList();
        return users.Select(MapToDto).ToList();
    }

    protected UserDto? GetUserByIdActionExecution(string id)
    {
        using var db = new UserContext();
        var user = db.AppUsers.FirstOrDefault(x => x.Id == id);
        return user == null ? null : MapToDto(user);
    }

    protected LoginResponseDto? UserLoginActionExecution(LoginRequestDto dto)
    {
        using var db = new UserContext();
        var user = db.AppUsers.FirstOrDefault(x => x.Email.ToLower() == dto.Email.ToLower() && x.Password == dto.Password);
        
        if (user == null) return null;

        return new LoginResponseDto
        {
            Token = $"mock-jwt-{user.Id}-{DateTime.UtcNow.Ticks}",
            UserId = user.Id,
            Role = user.Role.ToString(),
            Name = user.Name,
            Email = user.Email,
            IsDemo = user.Email.EndsWith("@demo.com", StringComparison.OrdinalIgnoreCase)
        };
    }

    protected UserDto UserSignUpActionExecution(SignUpRequestDto dto)
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid().ToString(),
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Password = dto.Password,
            Role = Role.USER
        };
        
        using var db = new UserContext();
        db.AppUsers.Add(user);
        db.SaveChanges();

        return MapToDto(user);
    }

    protected UserDto? UpdateUserActionExecution(string id, UpdateUserDto dto)
    {
        using var db = new UserContext();
        var user = db.AppUsers.FirstOrDefault(x => x.Id == id);
        if (user == null) return null;

        if (dto.Name != null) user.Name = dto.Name;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Avatar != null) user.Avatar = dto.Avatar;

        db.AppUsers.Update(user);
        db.SaveChanges();

        return MapToDto(user);
    }

    // -- NOTIFICATIONS --
    protected List<NotificationDto> GetAllNotificationActionExecution()
    {
        using var db = new UserContext();
        return db.AppNotifications.Select(MapNotifToDto).ToList();
    }

    protected List<NotificationDto> GetByUserIdNotificationActionExecution(string userId)
    {
        using var db = new UserContext();
        return db.AppNotifications.Where(x => x.UserId == userId).Select(MapNotifToDto).ToList();
    }

    protected NotificationDto CreateNotificationActionExecution(CreateNotificationDto dto)
    {
        var entity = new AppNotification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = dto.UserId, Type = Enum.Parse<NotificationType>(dto.Type), Title = dto.Title,
            Message = dto.Message, Read = false,
            CreatedAt = DateTime.UtcNow.ToString("o"), LinkTo = dto.LinkTo
        };
        
        using var db = new UserContext();
        db.AppNotifications.Add(entity);
        db.SaveChanges();
        return MapNotifToDto(entity);
    }

    protected bool MarkAsReadNotificationActionExecution(string id)
    {
        using var db = new UserContext();
        var n = db.AppNotifications.FirstOrDefault(x => x.Id == id);
        if (n == null) return false;
        n.Read = true;
        db.AppNotifications.Update(n);
        db.SaveChanges();
        return true;
    }

    protected void MarkAllAsReadNotificationActionExecution(string userId)
    {
        using var db = new UserContext();
        var nlist = db.AppNotifications.Where(x => x.UserId == userId && !x.Read).ToList();
        nlist.ForEach(x => x.Read = true);
        db.AppNotifications.UpdateRange(nlist);
        db.SaveChanges();
    }

    private static UserDto MapToDto(AppUser u) => new()
    {
        Id = u.Id, Name = u.Name, Email = u.Email,
        Phone = u.Phone, Role = u.Role.ToString(), Avatar = u.Avatar
    };

    private static NotificationDto MapNotifToDto(AppNotification n) => new()
    {
        Id = n.Id, UserId = n.UserId, Type = n.Type.ToString(),
        Title = n.Title, Message = n.Message, Read = n.Read,
        CreatedAt = n.CreatedAt, LinkTo = n.LinkTo
    };
}

