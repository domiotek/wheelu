using WheeluAPI.DTO.Errors;

namespace WheeluAPI.DTO.School;

public class CreateSchoolResult: ServiceActionResult<object> {
	public models.School? School { get; set; }
}