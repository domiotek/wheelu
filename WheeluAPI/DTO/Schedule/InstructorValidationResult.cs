using Microsoft.AspNetCore.Mvc;

namespace WheeluAPI.DTO.Schedule;

public class InstructorValidationResult
{
    public IActionResult? ActionResult { get; set; }

    public Models.Instructor? Instructor { get; set; }

    public models.User? Requestor { get; set; }
}
