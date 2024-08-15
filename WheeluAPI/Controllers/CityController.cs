namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.helpers;

[ApiController]
[Route("/api/v1/cities")]
public class CityController(ApplicationDbContext dbContext) : BaseAPIController {
	
	[HttpGet("")]
	[ProducesResponseType(typeof(List<City>), StatusCodes.Status200OK)]
	[Produces("application/json")]
	public async Task<IActionResult> GetCities() {
		var cities = await dbContext.Cities.ToListAsync();

		var result = new List<City>();

		foreach (var city in cities) {
			result.Add(new City { Id = city.Id, Name = city.Name,});
		}

		return Ok(result);
	}
}