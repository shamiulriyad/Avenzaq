using Backend.DTOs.Auth;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Backend.Models.Enums;
using Backend.Security;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtTokenGenerator _tokenGenerator;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(IUserRepository userRepository, JwtTokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var exists = await _userRepository.GetByEmailAsync(dto.Email.Trim().ToLowerInvariant());
        if (exists != null)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Role = UserRole.Customer
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var (token, expiresAtUtc) = _tokenGenerator.Generate(user);
        return new AuthResponseDto
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            Role = user.Role.ToString(),
            Email = user.Email,
            FullName = user.FullName
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.Trim().ToLowerInvariant())
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verify == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var (token, expiresAtUtc) = _tokenGenerator.Generate(user);
        return new AuthResponseDto
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            Role = user.Role.ToString(),
            Email = user.Email,
            FullName = user.FullName
        };
    }
}
