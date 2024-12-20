using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Course.CourseOffer;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class CourseOfferService(ApplicationDbContext dbContext) : BaseService, ICourseOfferService
{
    public ValueTask<CourseCategory?> GetCourseCategoryAsync(CourseCategoryType id)
    {
        return dbContext.CourseCategories.FindAsync(id);
    }

    public ValueTask<CourseOffer?> GetOfferByIDAsync(int id)
    {
        return dbContext.CourseOffers.FindAsync(id);
    }

    public Task<List<CourseOffer>> GetOffersAsync(CourseCategoryType? type = null)
    {
        if (type == null)
            return dbContext.CourseOffers.ToListAsync();

        return dbContext.CourseOffers.Where(o => o.Category.Id == type).ToListAsync();
    }

    public Task<List<CourseOffer>> GetOffersAsync(School school, CourseCategoryType? type = null)
    {
        var query =
            type == null
                ? dbContext.CourseOffers
                : dbContext.CourseOffers.Where(o => o.Category.Id == type);

        return query.Where(o => o.School == school).ToListAsync();
    }

    public IQueryable<CourseOffer> GetOffersPageAsync(
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<CourseOffer>? queryable = null
    )
    {
        var results = ApplyPaging(
            queryable ?? dbContext.CourseOffers.AsQueryable(),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public IQueryable<CourseOffer> PrepareQuery()
    {
        return dbContext.CourseOffers.AsQueryable();
    }

    public Task<int> CountAsync()
    {
        return dbContext.CourseOffers.CountAsync();
    }

    public async Task<
        ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>
    > CreateOfferAsync(CourseOfferData requestData, School targetSchool)
    {
        if (!Enum.IsDefined(typeof(CourseCategoryType), requestData.Category))
            return new ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>
            {
                ErrorCode = CreateCourseOfferErrors.InvalidCategory,
            };

        CourseCategory? category = await GetCourseCategoryAsync(
            (CourseCategoryType)requestData.Category
        );

        if (category == null)
            return new ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>
            {
                ErrorCode = CreateCourseOfferErrors.InvalidCategory,
            };

        var newOffer = new CourseOffer
        {
            Category = category,
            Enabled = requestData.Enabled,
            HoursCount = requestData.HoursCount,
            School = targetSchool,
            Price = requestData.Price,
            PricePerHour = requestData.PricePerHour,
            CreatedAt = DateTime.UtcNow,
            LastUpdatedAt = DateTime.UtcNow,
        };

        dbContext.CourseOffers.Add(newOffer);

        if (await dbContext.SaveChangesAsync() == 0)
            return new ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>
            {
                ErrorCode = CreateCourseOfferErrors.DBError,
            };

        return new ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>
        {
            IsSuccess = true,
            Data = newOffer,
        };
    }

    public async Task<bool> UpdateOfferAsync(
        CourseOffer offer,
        CourseOfferUpdateRequest requestData
    )
    {
        offer.Enabled = requestData.Enabled;
        offer.HoursCount = requestData.HoursCount;
        offer.Price = requestData.Price;
        offer.PricePerHour = requestData.PricePerHour;

        dbContext.Update(offer);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteOfferAsync(CourseOffer offer)
    {
        dbContext.Remove(offer);

        return await dbContext.SaveChangesAsync() > 0;
    }
}

public interface ICourseOfferService
{
    ValueTask<CourseCategory?> GetCourseCategoryAsync(CourseCategoryType id);

    ValueTask<CourseOffer?> GetOfferByIDAsync(int id);

    Task<List<CourseOffer>> GetOffersAsync(CourseCategoryType? type = null);

    Task<List<CourseOffer>> GetOffersAsync(School school, CourseCategoryType? type = null);

    IQueryable<CourseOffer> PrepareQuery();
    IQueryable<CourseOffer> GetOffersPageAsync(
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<CourseOffer>? queryable = null
    );

    Task<int> CountAsync();

    Task<ServiceActionWithDataResult<CreateCourseOfferErrors, CourseOffer>> CreateOfferAsync(
        CourseOfferData requestData,
        School targetSchool
    );

    Task<bool> UpdateOfferAsync(CourseOffer offer, CourseOfferUpdateRequest requestData);

    Task<bool> DeleteOfferAsync(CourseOffer offer);
}
