using WheeluAPI.DTO.Errors;

namespace WheeluAPI.DTO.School;

public class CreateSchoolResult: ServiceActionResult<CreateSchoolErrors> {
	public models.School? School { get; set; }
}