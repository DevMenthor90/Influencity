using InfluencerAPI.DTOs;
using InfluencerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluencerAPI.Controllers;

[ApiController]
[Route("api/deals")]
[Authorize]
public class DealsController(IDealService dealService) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
        ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? campaignName,
        [FromQuery] string? creatorName,
        [FromQuery] string? clientName,
        [FromQuery] string? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var filters = new DealFilters(campaignName, creatorName, clientName, status, dateFrom, dateTo, page, pageSize);
        var result = await dealService.GetAllAsync(filters);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var deal = await dealService.GetByIdAsync(id);
        return deal == null ? NotFound(new { message = "Deal no encontrado." }) : Ok(deal);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDealRequest request)
    {
        var deal = await dealService.CreateAsync(request, UserId);
        return CreatedAtAction(nameof(GetById), new { id = deal.Id }, deal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateDealRequest request)
    {
        var (success, message, data) = await dealService.UpdateAsync(id, request);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var (success, message) = await dealService.DeleteAsync(id);
        return success ? Ok(new { message }) : NotFound(new { message });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var data = await dealService.GetDashboardAsync();
        return Ok(data);
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] string? campaignName,
        [FromQuery] string? creatorName,
        [FromQuery] string? clientName,
        [FromQuery] string? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var filters = new DealFilters(campaignName, creatorName, clientName, status, dateFrom, dateTo, 1, 10000);
        var bytes = await dealService.ExportToExcelAsync(filters);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"deals_{DateTime.Now:yyyyMMdd}.xlsx");
    }
}
