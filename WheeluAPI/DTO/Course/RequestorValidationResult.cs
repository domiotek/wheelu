using Microsoft.AspNetCore.Mvc;

namespace WheeluAPI.DTO.Schedule;

public class RequestorValidationResult
{
    public IActionResult? ActionResult { get; set; }

    public Models.Course? Course { get; set; }

    public models.User? Requestor { get; set; }

    public bool IsTargetStudent { get; set; }
}
