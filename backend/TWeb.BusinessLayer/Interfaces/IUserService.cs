using TWeb.BusinessLayer.DTOs;

namespace TWeb.BusinessLayer.Interfaces;

public interface IUserService
{
    List<UserDto> GetAll();
    UserDto? GetById(string id);
    LoginResponseDto? Login(LoginRequestDto dto);
    UserDto SignUp(SignUpRequestDto dto);
    UserDto? Update(string id, UpdateUserDto dto);
}
