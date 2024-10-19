using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Course.InstructorChangeRequest;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Schedule;
using WheeluAPI.DTO.Transaction;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/courses/{courseID}")]
public class CourseController(
    ICourseOfferService offerService,
    ISchoolService schoolService,
    ISchoolInstructorService instructorService,
    IUserService userService,
    CourseService courseService,
    CourseMapper mapper,
    ScheduleService scheduleService,
    ScheduleMapper scheduleMapper,
    VehicleService vehicleService
) : BaseAPIController
{
    private async Task<RequestorValidationResult> ValidateAccess(int courseID)
    {
        var result = new RequestorValidationResult();
        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(requestorEmail ?? "");

        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
        {
            result.ActionResult = NotFound(new APIError { Code = APIErrorCode.EntityNotFound });
            return result;
        }

        var hasSchoolAccess = await schoolService.ValidateSchoolManagementAccess(
            course.School,
            requestorEmail!,
            SchoolManagementAccessMode.All
        );

        var isTargetStudent = course.Student.Id == requestor!.Id;

        if (!isTargetStudent && !hasSchoolAccess)
        {
            result.ActionResult = BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
            return result;
        }

        result.Requestor = requestor;
        result.Course = course;
        result.IsTargetStudent = isTargetStudent;
        return result;
    }

    private IRide? FindRideInCourse(Course course, int rideID)
    {
        IRide? ride = course!.Rides.Find(r => r.Id == rideID);

        ride ??= course!.CanceledRides.Find(r => r.Id == rideID);

        return ride;
    }

    private Ride? EnsureNonCanceledRide(IRide ride)
    {
        return ride.Status == RideStatus.Canceled ? null : (Ride)ride;
    }

    [HttpGet("/api/v1/schools/{schoolID}/courses")]
    [Authorize]
    [ProducesResponseType(typeof(List<LimitedCourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolCoursesAsync(
        int schoolID,
        [FromQuery] OptionalPagingMetadata pagingMeta
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                requestorEmail!,
                SchoolManagementAccessMode.All
            )
        )
        {
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var query = courseService.GetCoursesPageAsync(metadata, out appliedPageSize);

            var results = await query.Where(c => c.School == school).ToListAsync();

            return Paginated(
                mapper.MapToLimitedDTO(results),
                await courseService.CountAsync(school),
                appliedPageSize
            );
        }

        return Paginated(
            mapper.MapToLimitedDTO(school.Courses),
            school.Courses.Count,
            school.Courses.Count
        );
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(List<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseAsync(int courseID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        return Ok(mapper.GetDTO(validationResult.Course!));
    }

    [HttpPost("/api/v1/offers/{offerID}/purchase")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(BuyCourseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BuyCourseAsync(
        [FromBody] CreateCourseRequest request,
        int offerID
    )
    {
        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var offer = await offerService.GetOfferByIDAsync(offerID);

            if (offer == null || !offer.Enabled)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Offer not found."],
                    }
                );

            var instructor = await instructorService.GetInstructorByIDAsync(request.InstructorId);

            if (instructor == null)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Instructor not found"],
                    }
                );

            var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await userService.GetUserByEmailAsync(userID ?? "");

            var result = await courseService.ProcessCoursePurchaseRequest(
                user!,
                instructor,
                offer,
                request.TotalAmount
            );

            if (!result.IsSuccess)
            {
                return BadRequest(
                    new APIError<CoursePurchaseErrors>
                    {
                        Code = result.ErrorCode,
                        Details = result.Details,
                    }
                );
            }

            scope.Complete();
            return Ok(new BuyCourseResponse { PaymentUrl = result.Data!.PaymentUrl });
        }
    }

    [HttpPost("purchase-hours")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(BuyCourseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BuyHoursAsync([FromBody] BuyHoursRequest request, int courseID)
    {
        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var course = await courseService.GetCourseByIDAsync(courseID);

            if (course == null)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Offer not found."],
                    }
                );

            var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (course.Student.Email != userEmail)
                return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

            var result = await courseService.ProcessHoursPurchaseRequest(course, request);

            if (!result.IsSuccess)
            {
                return BadRequest(
                    new APIError<CourseHoursPurchaseErrors>
                    {
                        Code = result.ErrorCode,
                        Details = result.Details,
                    }
                );
            }

            scope.Complete();
            return Ok(new BuyCourseResponse { PaymentUrl = result.Data!.PaymentUrl });
        }
    }

    [HttpGet("rides")]
    [Authorize]
    [ProducesResponseType(typeof(List<RideResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRides(int courseID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        return Ok(
            scheduleMapper
                .MapToRideDTO(validationResult.Course!.Rides)
                .Concat(scheduleMapper.MapToRideDTO(validationResult.Course.CanceledRides))
                .OrderByDescending(c => c.StartTime ?? c.Slot?.StartTime)
        );
    }

    [HttpGet("hours-packages")]
    [Authorize]
    [ProducesResponseType(typeof(List<HoursPackageResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHoursPackages(int courseID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        return Ok(
            mapper
                .MapToHoursPackageDTO(validationResult.Course!.BoughtHoursPackages)
                .OrderByDescending(c => c.Created)
        );
    }

    [HttpGet("rides/{rideID}")]
    [Authorize]
    [ProducesResponseType(typeof(RideResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRide(int courseID, int rideID)
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        IRide? ride = FindRideInCourse(validationResult.Course!, rideID);

        if (ride == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Ride not found"] }
            );

        return Ok(
            ride.Status == RideStatus.Canceled
                ? scheduleMapper.GetRideDTO((CanceledRide)ride)
                : scheduleMapper.GetRideDTO((Ride)ride)
        );
    }

    [HttpPost("rides")]
    [Authorize(Roles = "Instructor,Student")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostRide(int courseID, [FromBody] NewRideRequest request)
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

            scope.Complete();
        }

        return StatusCode(201);
    }

    [HttpPut("rides/{rideID}")]
    [Authorize(Roles = "Instructor,Student")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangeRideState(
        int courseID,
        int rideID,
        [FromBody] ChangeRideStateRequest request
    )
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var iride = FindRideInCourse(validationResult.Course!, rideID);

            if (iride == null)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Ride not found"],
                    }
                );

            var ride = EnsureNonCanceledRide(iride);

            if (ride == null)
                return BadRequest(
                    new APIError<ChangeRideStateErrors>
                    {
                        Code = ChangeRideStateErrors.InvalidRideStatus,
                    }
                );

            ServiceActionResult<ChangeRideStateErrors> result;

            switch (request.NewStatus)
            {
                case RideStatus.Ongoing:
                    result = await scheduleService.StartRide(ride);
                    break;
                case RideStatus.Finished:
                    result = await scheduleService.EndRide(ride);
                    break;
                case RideStatus.Canceled:
                    result = await scheduleService.CancelRide(ride, validationResult.Requestor!);
                    break;
                default:
                    return BadRequest(
                        new APIError<ChangeRideStateErrors>
                        {
                            Code = ChangeRideStateErrors.InvalidRideStatus,
                        }
                    );
            }

            if (!result.IsSuccess)
                return BadRequest(
                    new APIError<ChangeRideStateErrors>
                    {
                        Code = result.ErrorCode,
                        Details = result.Details,
                    }
                );

            scope.Complete();
        }

        return StatusCode(201);
    }

    [HttpPut("rides/{rideID}/vehicle")]
    [Authorize(Roles = "Instructor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangeRideVehicle(
        int courseID,
        int rideID,
        [FromBody] ChangeRideVehicleRequest request
    )
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var iride = FindRideInCourse(validationResult.Course!, rideID);

            if (iride == null)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Ride not found"],
                    }
                );

            var ride = EnsureNonCanceledRide(iride);

            if (ride == null)
                return BadRequest(
                    new APIError<ChangeRideVehicleErrors>
                    {
                        Code = ChangeRideVehicleErrors.InvalidRideStatus,
                    }
                );

            var vehicle = await vehicleService.GetVehicleByIDAsync(request.NewVehicleId);

            if (vehicle == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Vehicle not found"],
                    }
                );

            var rideResult = await scheduleService.ChangeRideVehicle(ride, vehicle);

            if (!rideResult.IsSuccess)
                return BadRequest(
                    new APIError<ChangeRideVehicleErrors>
                    {
                        Code = rideResult.ErrorCode,
                        Details = rideResult.Details,
                    }
                );

            scope.Complete();
        }

        return Ok();
    }

    [HttpPut("instructor")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangeInstructorAsync(
        int courseID,
        [FromBody] ChangeInstructorRequest request
    )
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var course = validationResult.Course!;

            if (course.OngoingRide != null)
                return BadRequest(
                    new APIError<ChangeInstructorErrors>
                    {
                        Code = ChangeInstructorErrors.RideOngoing,
                    }
                );

            if (!await scheduleService.CancelAllRides(course, validationResult.Requestor!))
                return BadRequest(
                    new APIError<ChangeInstructorErrors> { Code = ChangeInstructorErrors.DbError }
                );

            var instructor = await instructorService.GetInstructorByIDAsync(request.InstructorId);

            if (instructor == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Instructor not found."],
                    }
                );

            var changeResult = await courseService.ChangeCourseInstructorAsync(
                course,
                instructor,
                true
            );

            if (!changeResult.IsSuccess)
                return BadRequest(
                    new APIError<ChangeInstructorErrors>
                    {
                        Code = changeResult.ErrorCode,
                        Details = changeResult.Details,
                    }
                );

            scope.Complete();
        }

        return Ok();
    }
}
