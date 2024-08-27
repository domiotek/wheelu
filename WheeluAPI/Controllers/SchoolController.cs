namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/schools")]
public class SchoolController(ISchoolService service) : BaseAPIController {

	[HttpGet("{schoolID}")]
	[Authorize]
	[ProducesResponseType(typeof(SchoolResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetSchool(int schoolID) {

		var school = await service.GetSchoolByID(schoolID);

		if(school==null) return NotFound();
		return Ok(school.GetDTO());
	}	

	[HttpGet]
	[Authorize]
	[ProducesResponseType(typeof(SchoolResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> GetAllSchools([FromQuery] OptionalPagingMetadata pagingMeta) {
		if(pagingMeta.PageNumber!=null) {
			int appliedPageSize;

			PagingMetadata metadata = new() {PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

			var results = await service.GetSchools(metadata,out appliedPageSize).ToListAsync();

			return Paginated(service.MapToDTO(results), await service.Count(),appliedPageSize);
		}

		var schools = await service.GetAllSchools();
		return Paginated(service.MapToDTO(schools), schools.Count,schools.Count);
	}

}