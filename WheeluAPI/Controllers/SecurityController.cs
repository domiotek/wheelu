using ImpromptuInterface;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1")]
public class SecurityController : ControllerBase
{
    private readonly ILogger<SecurityController> _logger;
    public SecurityController(ILogger<SecurityController> logger)
    {
        _logger = logger;
    }

    [HttpGet("me/basic")]
	[ProducesResponseType<GenericResponse<BasicUserDataResponse>>(StatusCodes.Status200OK)]
    public ActionResult<GenericResponse<BasicUserDataResponse>> GetUserData()
    {
		var result = new GenericResponse<BasicUserDataResponse> {
			state = true,
			data= new BasicUserDataResponse{
			id=1,
			name="Damian",
			role="Administrator"
		}
		};
		
        return new ActionResult<GenericResponse<BasicUserDataResponse>>(result);
    }
}
