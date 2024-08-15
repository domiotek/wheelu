namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
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
			return BadRequest(new APIError<ErrorCodes> {Code=ErrorCodes.ApplicationAlreadyFiled});

		if(await schoolService.FindExistingSchool(application)!=null)
			return BadRequest(new APIError<ErrorCodes> {Code=ErrorCodes.SchoolExists});

		try {
			await service.CreateApplication(application);
		}catch(Exception ex) {
			return Problem(ex.Message);
		}

		return StatusCode(204);
	}

}