using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Schedule;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/courses/{courseID}/exams")]
public class ExamController(
    ExamService service,
    CourseService courseService,
    IUserService userService,
    ScheduleService scheduleService,
    VehicleService vehicleService,
    ExamMapper mapper
) : BaseCourseController(userService, courseService)
{
    private readonly ExamService service = service;
    private readonly ExamMapper mapper = mapper;
    private readonly ScheduleService scheduleService = scheduleService;
    private readonly VehicleService vehicleService = vehicleService;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(List<ShortExamResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseExams(int courseID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        return Ok(
            mapper.MapToShortDTO(
                validationResult.Course!.Exams.OrderByDescending(e => e.Ride.StartTime)
            )
        );
    }

    [HttpGet("{examID}")]
    [Authorize]
    [ProducesResponseType(typeof(ExamResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseExam(int courseID, int examID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var exam = validationResult.Course!.Exams.FirstOrDefault(x => x.Id == examID);

        if (exam == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["No such exam"] }
            );

        return Ok(mapper.GetDTO(exam));
    }

    [HttpPost]
    [Authorize(Roles = "Instructor,Student")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PostCourseExam(int courseID, [FromBody] NewRideRequest request)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var slot = await scheduleService.GetSlotByIdAsync(request.SlotID);

            if (slot == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = { "Ride slot not found" },
                    }
                );

            var vehicle = await vehicleService.GetVehicleByIDAsync(request.VehicleID);

            if (vehicle == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Vehicle not found"],
                    }
                );

            var rideResult = await scheduleService.CreateRide(
                slot,
                validationResult.Course!,
                vehicle
            );

            if (!rideResult.IsSuccess)
                return BadRequest(
                    new APIError<CreateRideErrors>
                    {
                        Code = rideResult.ErrorCode,
                        Details = rideResult.Details,
                    }
                );

            var actionResult = await service.ScheduleExamAsync(
                validationResult.Course!,
                rideResult.Data!
            );

            if (!actionResult.IsSuccess)
                return BadRequest(
                    new APIError<ScheduleExamErrors>
                    {
                        Code = actionResult.ErrorCode,
                        Details = actionResult.Details,
                    }
                );

            scope.Complete();
        }

        return StatusCode(201);
    }

    [HttpPut("{examID}")]
    [Authorize(Roles = "Instructor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> StartCourseExam(int courseID, int examID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var exam = validationResult.Course!.Exams.FirstOrDefault(x => x.Id == examID);

        if (exam == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["No such exam"] }
            );

        var actionResult = await service.StartExamAsync(exam);

        if (!actionResult)
            return BadRequest(new APIError { Code = APIErrorCode.DbError });

        return Ok();
    }

    [HttpDelete("{examID}")]
    [Authorize(Roles = "Instructor,Student")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelCourseExam(int courseID, int examID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var exam = validationResult.Course!.Exams.FirstOrDefault(x => x.Id == examID);

        if (exam == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["No such exam"] }
            );

        var actionResult = await service.CancelExamAsync(exam, validationResult.Requestor!);

        if (!actionResult)
            return BadRequest(new APIError { Code = APIErrorCode.DbError });

        return Ok();
    }
}
