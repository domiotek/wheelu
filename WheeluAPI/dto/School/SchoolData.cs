using WheeluAPI.models;

namespace WheeluAPI.DTO.School;
public class SchoolData {
	public required string SchoolName { get; set; }
	public required string Nip { get; set; }
	public required models.User Owner { get; set; }
	public required DateOnly EstablishedDate { get; set; }
	public required string PhoneNumber { get; set; }
	public required Address Address { get; set; }
	public required List<models.City> NearbyCities { get; set; }
}