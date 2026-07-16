using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InfluencerAPI.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("fullName")]
    public string FullName { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = "admin"; // Preparado para múltiples roles

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("refreshToken")]
    public string? RefreshToken { get; set; }

    [BsonElement("refreshTokenExpiry")]
    public DateTime? RefreshTokenExpiry { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
