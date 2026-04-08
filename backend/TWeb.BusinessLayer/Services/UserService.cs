using TWeb.BusinessLayer.DTOs;
using TWeb.BusinessLayer.Interfaces;
using TWeb.DataAccessLayer;
using TWeb.Domain.Entities;
using TWeb.Domain.Enums;

namespace TWeb.BusinessLayer.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public List<UserDto> GetAll() =>
        _db.Users.Select(u => MapToDto(u)).ToList();

    public UserDto? GetById(string id)
    {
        var user = _db.Users.Find(id);
        return user == null ? null : MapToDto(user);
    }

    public LoginResponseDto? Login(LoginRequestDto dto)
    {
        var user = _db.Users.FirstOrDefault(u =>
            u.Email.ToLower() == dto.Email.ToLower() &&
            u.Password == dto.Password);
        if (user == null) return null;

        return new LoginResponseDto
        {
            Token = $"mock-jwt-{user.Id}-{DateTime.UtcNow.Ticks}",
            UserId = user.Id,
            Role = user.Role.ToString(),
            Name = user.Name,
            Email = user.Email
        };
    }

    public UserDto SignUp(SignUpRequestDto dto)
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
        _db.Users.Add(user);
        _db.SaveChanges();
        return MapToDto(user);
    }

    public UserDto? Update(string id, UpdateUserDto dto)
    {
        var user = _db.Users.Find(id);
        if (user == null) return null;

        if (dto.Name != null) user.Name = dto.Name;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Avatar != null) user.Avatar = dto.Avatar;

        _db.SaveChanges();
        return MapToDto(user);
    }

    private static UserDto MapToDto(AppUser u) => new()
    {
        Id = u.Id, Name = u.Name, Email = u.Email,
        Phone = u.Phone, Role = u.Role.ToString(), Avatar = u.Avatar
    };
}
