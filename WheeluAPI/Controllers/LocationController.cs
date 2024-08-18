namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.helpers;

[ApiController]
[Route("/api/v1/")]
public class LocationController(ApplicationDbContext dbContext) : BaseAPIController {
	
	[HttpGet("cities")]
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

	
	[HttpGet("states")]
	[ProducesResponseType(typeof(List<State>), StatusCodes.Status200OK)]
	[Produces("application/json")]
	public async Task<IActionResult> GetStates() {
		var states = await dbContext.States.ToListAsync();

		var result = new List<State>();

		foreach (var state in states) {
			result.Add(new State { Id = state.Id, Name = state.Name});
		}

		return Ok(result);
	}
}