using Microsoft.AspNetCore.Identity;
using WheeluAPI.DTO.User;

namespace WheeluAPI.models;


public class User: IdentityUser {
	public required string Name { get; set; }

	public required string Surname { get; set; }

	public required DateOnly Birthday { get; set; }

	public required DateTime CreatedAt { get; set; }

	public ShortUserResponse GetShortDTO() {
		return new ShortUserResponse {
			Id = Id,
			Name = Name,
			Surname = Surname
		};
	}
}