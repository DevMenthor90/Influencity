using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InfluencerAPI.Models;

public class Deal
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("dealNumber")]
    public int DealNumber { get; set; } // ID legible: DEAL-001

    // === Información General ===
    [BsonElement("creatorName")]
    public string CreatorName { get; set; } = string.Empty;

    [BsonElement("clientName")]
    public string ClientName { get; set; } = string.Empty;

    [BsonElement("campaignName")]
    public string CampaignName { get; set; } = string.Empty;

    [BsonElement("contentType")]
    public string ContentType { get; set; } = string.Empty; // TikTokPost | InstagramReel | InstagramStory | YouTubeVideo

    [BsonElement("currency")]
    public string Currency { get; set; } = "COP"; // COP | USD

    [BsonElement("totalValue")]
    public decimal TotalValue { get; set; }

    [BsonElement("creatorPayment")]
    public decimal CreatorPayment { get; set; } // 80% calculado

    [BsonElement("commission")]
    public decimal Commission { get; set; } // 20% calculado

    // === Estado ===
    [BsonElement("status")]
    public string Status { get; set; } = "Confirmado"; // Confirmado | Publicado | Cancelado

    // === Publicación ===
    [BsonElement("publicationLink")]
    public string? PublicationLink { get; set; }

    [BsonElement("publicationDate")]
    public DateTime? PublicationDate { get; set; }

    [BsonElement("notes")]
    public string? Notes { get; set; }

    // === Aprobación para Facturación ===
    [BsonElement("approvedToBill")]
    public bool ApprovedToBill { get; set; } = false;

    [BsonElement("approvedToBillDate")]
    public DateTime? ApprovedToBillDate { get; set; }

    // === Control de Pagos ===
    [BsonElement("creatorPaymentReceived")]
    public bool CreatorPaymentReceived { get; set; } = false;

    [BsonElement("creatorPaymentDate")]
    public DateTime? CreatorPaymentDate { get; set; }

    [BsonElement("commissionReceived")]
    public bool CommissionReceived { get; set; } = false;

    [BsonElement("commissionReceivedDate")]
    public DateTime? CommissionReceivedDate { get; set; }

    // === Auditoría ===
    [BsonElement("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
