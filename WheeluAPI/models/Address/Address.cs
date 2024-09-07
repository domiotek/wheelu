using WheeluAPI.DTO.Location;

namespace WheeluAPI.models;

public class Address
{
    public int Id { get; set; }

    public required string Street { get; set; }

    public required string BuildingNumber { get; set; }

    public int? SubBuildingNumber { get; set; }
    public virtual required ZipCode ZipCode { get; set; }

    public AddressResponse GetDTO()
    {
        return new AddressResponse
        {
            Street = Street,
            BuildingNumber = BuildingNumber,
            SubBuildingNumber = SubBuildingNumber,
            ZipCode = ZipCode.Name,
            City = ZipCode.City.Name,
            State = ZipCode.City.State.Name,
        };
    }
}
