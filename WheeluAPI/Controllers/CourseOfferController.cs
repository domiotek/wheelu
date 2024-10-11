using System.Linq.Expressions;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Course.CourseOffer;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/offers")]
public class CourseOfferController(
    ICourseOfferService service,
    ISchoolService schoolService,
    IUserService userService,
    CourseOfferDTOMapper mapper
) : BaseAPIController
{
    [HttpGet("{offerID}")]
    [Authorize]
    [ProducesResponseType(typeof(CourseOfferResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSpecific(int offerID)
    {
        var offer = await service.GetOfferByIDAsync(offerID);

        if (offer == null)
            return NotFound();

        return Ok(mapper.GetDTO(offer));
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(CourseOfferResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllOffers(
        [FromQuery] OptionalPagingMetadata pagingMeta,
        [FromQuery] int? schoolID
    )
    {
        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var query = service.GetOffersPageAsync(metadata, out appliedPageSize);

            if (schoolID != null)
                query.Where(o => o.School.Id == schoolID);

            var results = await query.ToListAsync();

            return Paginated(mapper.MapToDTO(results), await service.CountAsync(), appliedPageSize);
        }

        if (schoolID == null)
        {
            var offers = await service.GetOffersAsync();
            return Paginated(mapper.MapToDTO(offers), offers.Count, offers.Count);
        }

        var school = await schoolService.GetSchoolByID((int)schoolID);

        if (school == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found"] }
            );

        var schoolOffers = await service.GetOffersAsync(school);

        return Paginated(mapper.MapToDTO(schoolOffers), schoolOffers.Count, schoolOffers.Count);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchOffersAsync(
        [FromQuery] PagingMetadata pagingMetadata,
        [FromQuery] CourseSearchRequest requestData
    )
    {
        var query = service.PrepareQuery();

        query = query.Where(o => o.Enabled && !o.School.Hidden);

        if (requestData.CategoryType != null)
            query = query.Where(x => x.Category.Id == requestData.CategoryType);

        var sortExpressions = new Dictionary<SortingOptions, Expression<Func<CourseOffer, object>>>
        {
            { SortingOptions.Price, x => x.Price },
        };

        var sortExpression = sortExpressions.TryGetValue(
            requestData.SortingTarget,
            out Expression<Func<CourseOffer, object>>? value
        )
            ? value
            : x => x.Id;

        query =
            requestData.SortingType == SortingType.Asc
                ? query.OrderBy(sortExpression)
                : query.OrderByDescending(sortExpression);

        var totalItems = await query.CountAsync();

        int appliedPageSize;

        var results = await service
            .GetOffersPageAsync(pagingMetadata, out appliedPageSize, query)
            .ToListAsync();

        return Paginated(mapper.MapToSearchDTO(results), totalItems, appliedPageSize);
    }

    [HttpPost]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostNew([FromBody] CourseOfferData request)
    {
        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        var school = await schoolService.GetSchoolByID(request.SchoolId);

        if (school == null)
            return BadRequest(
                new APIError<CreateCourseOfferErrors>
                {
                    Code = CreateCourseOfferErrors.SchoolNotFound,
                }
            );

        if (school.Owner.Id != user?.Id)
            return BadRequest(
                new APIError<CreateCourseOfferErrors>
                {
                    Code = CreateCourseOfferErrors.AccessDenied,
                }
            );

        var result = await service.CreateOfferAsync(request, school);

        if (!result.IsSuccess)
        {
            if (result.ErrorCode == CreateCourseOfferErrors.DBError)
                return Problem();
            return BadRequest(new APIError<CreateCourseOfferErrors> { Code = result.ErrorCode });
        }

        return StatusCode(201);
    }

    [HttpPut("{offerID}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateExisting(
        [FromBody] CourseOfferUpdateRequest request,
        int offerID
    )
    {
        var offer = await service.GetOfferByIDAsync(offerID);

        if (offer == null)
            return NotFound();

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        if (offer.School.Owner.Id != user?.Id)
            return BadRequest(new APIError<APIErrorCode> { Code = APIErrorCode.AccessDenied });

        if (await service.UpdateOfferAsync(offer, request))
            return Ok();

        return Problem();
    }

    [HttpDelete("{offerID}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteExisting(int offerID)
    {
        var offer = await service.GetOfferByIDAsync(offerID);

        if (offer == null)
            return NotFound();

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        if (offer.School.Owner.Id != user?.Id)
            return BadRequest(new APIError<APIErrorCode> { Code = APIErrorCode.AccessDenied });

        if (await service.DeleteOfferAsync(offer))
            return Ok();

        return Problem();
    }
}
