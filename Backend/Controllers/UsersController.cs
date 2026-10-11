using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly MarketplaceDbContext _db;

    public UsersController(IUserRepository userRepository, MarketplaceDbContext db)
    {
        _userRepository = userRepository;
        _db = db;
    }

    [HttpGet("me")]
    public async Task<ActionResult<object>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userGuid);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            userId = user.Id,
            email = user.Email,
            fullName = user.FullName,
            phone = user.Phone ?? "",
            avatar = user.Avatar ?? "",
            role = user.Role.ToString(),
            isActive = user.IsActive
        });
    }

    [HttpPut("me")]
    public async Task<ActionResult<object>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userGuid);
        if (user == null)
        {
            return NotFound();
        }

        // Update allowed fields
        if (!string.IsNullOrWhiteSpace(dto.FullName))
            user.FullName = dto.FullName;

        if (!string.IsNullOrWhiteSpace(dto.Phone))
            user.Phone = dto.Phone;

        if (!string.IsNullOrWhiteSpace(dto.Avatar))
            user.Avatar = dto.Avatar;

        _db.Users.Update(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            userId = user.Id,
            email = user.Email,
            fullName = user.FullName,
            phone = user.Phone ?? "",
            avatar = user.Avatar ?? "",
            role = user.Role.ToString(),
            message = "Profile updated successfully"
        });
    }
}

public class UpdateProfileDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
}
