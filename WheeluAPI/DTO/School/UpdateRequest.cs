using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using WheeluAPI.DTO.SchoolApplication;

namespace WheeluAPI.DTO.School;

public class SchoolUpdateRequest
{
    [StringLength(50)]
    public required string Name { get; set; }

    [StringLength(10)]
    public required string Nip { get; set; }

    [StringLength(16)]
    public required string PhoneNumber { get; set; }

    [StringLength(50)]
    public required string Email { get; set; }

    [StringLength(maximumLength: 250)]
    public string? Description { get; set; }

    [StringLength(maximumLength: 75, MinimumLength = 2)]
    public required string Street { get; set; }

    [StringLength(10)]
    public required string BuildingNumber { get; set; }

    public int? SubBuildingNumber { get; set; }

    [StringLength(maximumLength: 6, MinimumLength = 6)]
    public required string ZipCode { get; set; }

    [StringLength(maximumLength: 50, MinimumLength = 2)]
    public required string City { get; set; }

    public required string State { get; set; }

    public List<NearbyCityDefinition>? NearbyCities { get; set; }

    [JsonProperty("coverPhoto")]
    public IFormFile? CoverPhoto { get; set; }
}
