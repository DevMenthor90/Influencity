using InfluencerAPI.DTOs;
using InfluencerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluencerAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email y contraseña son requeridos." });

        if (request.Password.Length < 8)
            return BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });

        var (success, message, data) = await authService.RegisterAsync(request);
        return success ? Ok(new { message, data }) : Conflict(new { message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, message, data) = await authService.LoginAsync(request);
        return success ? Ok(new { message, data }) : Unauthorized(new { message });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var (success, message, data) = await authService.RefreshTokenAsync(request);
        return success ? Ok(new { message, data }) : Unauthorized(new { message });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                     User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (userId == null) return Unauthorized();
        await authService.RevokeTokenAsync(userId);
        return Ok(new { message = "Sesión cerrada." });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            userId = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub),
            email = User.FindFirstValue(ClaimTypes.Email),
            fullName = User.FindFirstValue(ClaimTypes.Name),
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }
}
