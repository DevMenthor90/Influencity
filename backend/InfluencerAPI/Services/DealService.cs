using ClosedXML.Excel;
using InfluencerAPI.DTOs;
using InfluencerAPI.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace InfluencerAPI.Services;

public interface IDealService
{
    Task<DealResponse> CreateAsync(CreateDealRequest request, string userId);
    Task<PagedResponse<DealResponse>> GetAllAsync(DealFilters filters);
    Task<DealResponse?> GetByIdAsync(string id);
    Task<(bool Success, string Message, DealResponse? Data)> UpdateAsync(string id, UpdateDealRequest request);
    Task<(bool Success, string Message)> DeleteAsync(string id);
    Task<DashboardResponse> GetDashboardAsync();
    Task<byte[]> ExportToExcelAsync(DealFilters filters);
}

public class DealService(IMongoDatabase db) : IDealService
{
    private readonly IMongoCollection<Deal> _deals = db.GetCollection<Deal>("deals");
    private readonly IMongoCollection<BsonDocument> _counters = db.GetCollection<BsonDocument>("counters");

    private async Task<int> GetNextDealNumberAsync()
    {
        var filter = Builders<BsonDocument>.Filter.Eq("_id", "dealNumber");
        var update = Builders<BsonDocument>.Update.Inc("seq", 1);
        var options = new FindOneAndUpdateOptions<BsonDocument> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
        var result = await _counters.FindOneAndUpdateAsync(filter, update, options);
        return result["seq"].AsInt32;
    }

    public async Task<DealResponse> CreateAsync(CreateDealRequest request, string userId)
    {
        var dealNumber = await GetNextDealNumberAsync();
        var deal = new Deal
        {
            DealNumber = dealNumber,
            CreatorName = request.CreatorName.Trim(),
            ClientName = request.ClientName.Trim(),
            CampaignName = request.CampaignName.Trim(),
            ContentType = request.ContentType,
            Currency = request.Currency,
            TotalValue = request.TotalValue,
            CreatorPayment = Math.Round(request.TotalValue * 0.80m, 2),
            Commission = Math.Round(request.TotalValue * 0.20m, 2),
            Status = "Confirmado",
            CreatedBy = userId
        };

        await _deals.InsertOneAsync(deal);
        return ToResponse(deal);
    }

    public async Task<PagedResponse<DealResponse>> GetAllAsync(DealFilters filters)
    {
        var builder = Builders<Deal>.Filter;
        var filterDef = builder.Empty;

        if (!string.IsNullOrEmpty(filters.CampaignName))
            filterDef &= builder.Regex(d => d.CampaignName, new BsonRegularExpression(filters.CampaignName, "i"));

        if (!string.IsNullOrEmpty(filters.CreatorName))
            filterDef &= builder.Regex(d => d.CreatorName, new BsonRegularExpression(filters.CreatorName, "i"));

        if (!string.IsNullOrEmpty(filters.ClientName))
            filterDef &= builder.Regex(d => d.ClientName, new BsonRegularExpression(filters.ClientName, "i"));

        if (!string.IsNullOrEmpty(filters.Status))
            filterDef &= builder.Eq(d => d.Status, filters.Status);

        if (filters.DateFrom.HasValue)
            filterDef &= builder.Gte(d => d.CreatedAt, filters.DateFrom.Value);

        if (filters.DateTo.HasValue)
            filterDef &= builder.Lte(d => d.CreatedAt, filters.DateTo.Value.AddDays(1));

        var total = await _deals.CountDocumentsAsync(filterDef);
        var skip = (filters.Page - 1) * filters.PageSize;

        var items = await _deals.Find(filterDef)
            .SortByDescending(d => d.CreatedAt)
            .Skip(skip)
            .Limit(filters.PageSize)
            .ToListAsync();

        return new PagedResponse<DealResponse>(
            items.Select(ToResponse),
            (int)total,
            filters.Page,
            filters.PageSize,
            (int)Math.Ceiling((double)total / filters.PageSize)
        );
    }

    public async Task<DealResponse?> GetByIdAsync(string id)
    {
        var deal = await _deals.Find(d => d.Id == id).FirstOrDefaultAsync();
        return deal == null ? null : ToResponse(deal);
    }

    public async Task<(bool, string, DealResponse?)> UpdateAsync(string id, UpdateDealRequest request)
    {
        var deal = await _deals.Find(d => d.Id == id).FirstOrDefaultAsync();
        if (deal == null) return (false, "Deal no encontrado.", null);

        // Regla de negocio: ApprovedToBill solo si hay link de publicación
        if (request.ApprovedToBill == true && string.IsNullOrEmpty(deal.PublicationLink) &&
            string.IsNullOrEmpty(request.PublicationLink))
            return (false, "No se puede aprobar para facturación sin un link de publicación.", null);

        var updateDef = Builders<Deal>.Update.Set(d => d.UpdatedAt, DateTime.UtcNow);

        if (request.CreatorName != null) updateDef = updateDef.Set(d => d.CreatorName, request.CreatorName.Trim());
        if (request.ClientName != null) updateDef = updateDef.Set(d => d.ClientName, request.ClientName.Trim());
        if (request.CampaignName != null) updateDef = updateDef.Set(d => d.CampaignName, request.CampaignName.Trim());
        if (request.ContentType != null) updateDef = updateDef.Set(d => d.ContentType, request.ContentType);
        if (request.Currency != null) updateDef = updateDef.Set(d => d.Currency, request.Currency);
        if (request.Status != null) updateDef = updateDef.Set(d => d.Status, request.Status);
        if (request.PublicationLink != null) updateDef = updateDef.Set(d => d.PublicationLink, request.PublicationLink);
        if (request.PublicationDate.HasValue) updateDef = updateDef.Set(d => d.PublicationDate, request.PublicationDate);
        if (request.Notes != null) updateDef = updateDef.Set(d => d.Notes, request.Notes);
        if (request.ApprovedToBill.HasValue) updateDef = updateDef.Set(d => d.ApprovedToBill, request.ApprovedToBill.Value);
        if (request.CreatorPaymentReceived.HasValue) updateDef = updateDef.Set(d => d.CreatorPaymentReceived, request.CreatorPaymentReceived.Value);
        if (request.CreatorPaymentDate.HasValue) updateDef = updateDef.Set(d => d.CreatorPaymentDate, request.CreatorPaymentDate);
        if (request.CommissionReceived.HasValue) updateDef = updateDef.Set(d => d.CommissionReceived, request.CommissionReceived.Value);
        if (request.CommissionReceivedDate.HasValue) updateDef = updateDef.Set(d => d.CommissionReceivedDate, request.CommissionReceivedDate);

        if (request.TotalValue.HasValue)
        {
            updateDef = updateDef
                .Set(d => d.TotalValue, request.TotalValue.Value)
                .Set(d => d.CreatorPayment, Math.Round(request.TotalValue.Value * 0.80m, 2))
                .Set(d => d.Commission, Math.Round(request.TotalValue.Value * 0.20m, 2));
        }

        await _deals.UpdateOneAsync(d => d.Id == id, updateDef);
        var updated = await _deals.Find(d => d.Id == id).FirstOrDefaultAsync();
        return (true, "Deal actualizado.", ToResponse(updated!));
    }

    public async Task<(bool, string)> DeleteAsync(string id)
    {
        var result = await _deals.DeleteOneAsync(d => d.Id == id);
        return result.DeletedCount > 0 ? (true, "Deal eliminado.") : (false, "Deal no encontrado.");
    }

    public async Task<DashboardResponse> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var allDeals = await _deals.Find(_ => true).ToListAsync();

        var activeDeals = allDeals.Count(d => d.Status != "Cancelado");
        var thisMonth = allDeals.Where(d => d.CreatedAt >= startOfMonth).ToList();
        var totalValueMonth = thisMonth.Sum(d => d.TotalValue);
        var totalCommissionsMonth = thisMonth.Sum(d => d.Commission);
        var pendingCommissions = allDeals.Where(d => !d.CommissionReceived && d.Status != "Cancelado").Sum(d => d.Commission);
        var publishedDeals = allDeals.Count(d => d.Status == "Publicado");
        var cancelledDeals = allDeals.Count(d => d.Status == "Cancelado");
        var dealsWithoutLink = allDeals.Count(d => string.IsNullOrEmpty(d.PublicationLink) && d.Status != "Cancelado");
        var pendingApproval = allDeals.Count(d => !d.ApprovedToBill && !string.IsNullOrEmpty(d.PublicationLink) && d.Status != "Cancelado");
        var pendingCommissionCount = allDeals.Count(d => !d.CommissionReceived && d.Status != "Cancelado");

        return new DashboardResponse(activeDeals, totalValueMonth, totalCommissionsMonth,
            pendingCommissions, publishedDeals, cancelledDeals,
            dealsWithoutLink, pendingApproval, pendingCommissionCount);
    }

    public async Task<byte[]> ExportToExcelAsync(DealFilters filters)
    {
        var pagedResult = await GetAllAsync(filters with { Page = 1, PageSize = 10000 });
        var deals = pagedResult.Items.ToList();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Deals");

        // Headers
        var headers = new[] {
            "ID", "Creador", "Cliente", "Campaña", "Tipo Contenido", "Moneda",
            "Valor Total", "Pago Creador (80%)", "Comisión (20%)", "Estado",
            "Link Publicación", "Fecha Publicación", "Aprobado Facturar",
            "Pago Creador Recibido", "Fecha Pago Creador",
            "Comisión Recibida", "Fecha Comisión", "Notas", "Fecha Creación"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e40af");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // Rows
        int row = 2;
        foreach (var d in deals)
        {
            ws.Cell(row, 1).Value = $"DEAL-{d.DealNumber:D3}";
            ws.Cell(row, 2).Value = d.CreatorName;
            ws.Cell(row, 3).Value = d.ClientName;
            ws.Cell(row, 4).Value = d.CampaignName;
            ws.Cell(row, 5).Value = d.ContentType;
            ws.Cell(row, 6).Value = d.Currency;
            ws.Cell(row, 7).Value = d.TotalValue;
            ws.Cell(row, 8).Value = d.CreatorPayment;
            ws.Cell(row, 9).Value = d.Commission;
            ws.Cell(row, 10).Value = d.Status;
            ws.Cell(row, 11).Value = d.PublicationLink ?? "";
            ws.Cell(row, 12).Value = d.PublicationDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 13).Value = d.ApprovedToBill ? "Sí" : "No";
            ws.Cell(row, 14).Value = d.CreatorPaymentReceived ? "Sí" : "No";
            ws.Cell(row, 15).Value = d.CreatorPaymentDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 16).Value = d.CommissionReceived ? "Sí" : "No";
            ws.Cell(row, 17).Value = d.CommissionReceivedDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 18).Value = d.Notes ?? "";
            ws.Cell(row, 19).Value = d.CreatedAt.ToString("yyyy-MM-dd");
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static DealResponse ToResponse(Deal d) => new(
        d.Id, d.DealNumber, d.CreatorName, d.ClientName, d.CampaignName,
        d.ContentType, d.Currency, d.TotalValue, d.CreatorPayment, d.Commission,
        d.Status, d.PublicationLink, d.PublicationDate, d.Notes, d.ApprovedToBill,
        d.CreatorPaymentReceived, d.CreatorPaymentDate,
        d.CommissionReceived, d.CommissionReceivedDate, d.CreatedAt, d.UpdatedAt
    );
}
