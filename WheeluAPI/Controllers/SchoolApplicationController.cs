namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/applications")]
public class SchoolApplicationController(ISchoolApplicationService service, ISchoolService schoolService) : BaseAPIController {

	[HttpPost]
	public async Task<IActionResult> PostApplication([FromBody] SchoolApplicationData application) {
		var validationResult = service.ValidateApplicationData(application);

		if(!validationResult.IsValid) {
			return ValidationProblem(validationResult.Errors);
		}

		if(await service.FindExistingApplication(application)!=null) 
			return BadRequest(new APIError<SchoolApplicationErrorCodes> {Code=SchoolApplicationErrorCodes.ApplicationAlreadyFiled});

		if(await schoolService.FindExistingSchool(application)!=null)
			return BadRequest(new APIError<SchoolApplicationErrorCodes> {Code=SchoolApplicationErrorCodes.SchoolExists});

		try {
			await service.CreateApplication(application);
		}catch(Exception ex) {
			return Problem(ex.Message);
		}

		return StatusCode(204);
	}

	[HttpGet]
	[Authorize(Roles = "Administrator")]
	public async Task<IActionResult> GetAllApplications([FromQuery] OptionalPagingMetadata pagingMeta) {
		if(pagingMeta.PageNumber!=null) {
			int appliedPageSize;

			PagingMetadata metadata = new() {PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

			var results = await service.GetApplications(metadata,out appliedPageSize).ToListAsync();

			return Paginated(results, await service.Count(),appliedPageSize);
		}

		return Ok(await service.GetAllApplications());
	}

}