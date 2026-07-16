using InfluencerAPI.Config;
using InfluencerAPI.DTOs;
using InfluencerAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace InfluencerAPI.Services;

public interface IAuthService
{
    Task<(bool Success, string Message, AuthResponse? Data)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string Message, AuthResponse? Data)> LoginAsync(LoginRequest request);
    Task<(bool Success, string Message, AuthResponse? Data)> RefreshTokenAsync(RefreshTokenRequest request);
    Task<bool> RevokeTokenAsync(string userId);
}

public class AuthService(
    IMongoDatabase db,
    ITokenService tokenService,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly IMongoCollection<User> _users = db.GetCollection<User>("users");
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public async Task<(bool, string, AuthResponse?)> RegisterAsync(RegisterRequest request)
    {
        var existing = await _users.Find(u => u.Email == request.Email.ToLower()).FirstOrDefaultAsync();
        if (existing != null)
            return (false, "El correo ya está registrado.", null);

        var user = new User
        {
            Email = request.Email.ToLower().Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "admin"
        };

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays);

        await _users.InsertOneAsync(user);

        var accessToken = tokenService.GenerateAccessToken(user);
        return (true, "Registro exitoso.", new AuthResponse(accessToken, refreshToken, user.Id, user.Email, user.FullName, user.Role));
    }

    public async Task<(bool, string, AuthResponse?)> LoginAsync(LoginRequest request)
    {
        var user = await _users.Find(u => u.Email == request.Email.ToLower()).FirstOrDefaultAsync();
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (false, "Credenciales inválidas.", null);

        if (!user.IsActive)
            return (false, "Cuenta desactivada.", null);

        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();

        var update = Builders<User>.Update
            .Set(u => u.RefreshToken, refreshToken)
            .Set(u => u.RefreshTokenExpiry, DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays))
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        await _users.UpdateOneAsync(u => u.Id == user.Id, update);

        return (true, "Login exitoso.", new AuthResponse(accessToken, refreshToken, user.Id, user.Email, user.FullName, user.Role));
    }

    public async Task<(bool, string, AuthResponse?)> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var user = await _users.Find(u =>
            u.RefreshToken == request.RefreshToken &&
            u.RefreshTokenExpiry > DateTime.UtcNow).FirstOrDefaultAsync();

        if (user == null)
            return (false, "Refresh token inválido o expirado.", null);

        var accessToken = tokenService.GenerateAccessToken(user);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        var update = Builders<User>.Update
            .Set(u => u.RefreshToken, newRefreshToken)
            .Set(u => u.RefreshTokenExpiry, DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays))
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        await _users.UpdateOneAsync(u => u.Id == user.Id, update);

        return (true, "Token renovado.", new AuthResponse(accessToken, newRefreshToken, user.Id, user.Email, user.FullName, user.Role));
    }

    public async Task<bool> RevokeTokenAsync(string userId)
    {
        var update = Builders<User>.Update
            .Set(u => u.RefreshToken, null)
            .Set(u => u.RefreshTokenExpiry, null)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        var result = await _users.UpdateOneAsync(u => u.Id == userId, update);
        return result.ModifiedCount > 0;
    }
}
