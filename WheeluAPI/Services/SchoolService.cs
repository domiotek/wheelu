using System.Transactions;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.models;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.Services;

public class Schoolervice(
    ApplicationDbContext dbContext,
    IImageService imageService,
    ILocationService locationService,
    IUserService userService,
    IInstructorService instructorService
) : BaseService, ISchoolService
{
    public ValueTask<School?> GetSchoolByID(int id)
    {
        return dbContext.Schools.FindAsync(id);
    }

    public Task<School?> FindExistingSchool(SchoolApplicationData applicationData)
    {
        return dbContext.Schools.Where(a => a.NIP == applicationData.NIP).SingleOrDefaultAsync();
    }

    public Task<List<School>> GetAllSchools()
    {
        return dbContext.Schools.ToListAsync();
    }

    public IQueryable<School> GetSchools(PagingMetadata meta, out int appliedPageSize)
    {
        var results = ApplyPaging(dbContext.Schools.AsQueryable(), meta, out int actualPageSize);

        appliedPageSize = actualPageSize;

        return results;
    }

    public IQueryable<School> GetPageAsync(
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<School>? queryable = null
    )
    {
        var results = ApplyPaging(
            queryable ?? dbContext.Schools.AsQueryable(),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public IQueryable<School> PrepareQuery()
    {
        return dbContext.Schools.AsQueryable();
    }

    public Task<int> Count()
    {
        return dbContext.Schools.CountAsync();
    }

    public async Task<School?> CreateSchool(SchoolData requestData)
    {
        var placeholderImage =
            await imageService.GetImage(1)
            ?? new Image
            {
                Id = 0,
                FileName = "",
                UploadDate = DateTime.UtcNow,
            };

        var school = new School
        {
            Hidden = true,
            Name = requestData.SchoolName,
            NIP = requestData.Nip,
            Owner = requestData.Owner,
            OwnerId = requestData.Owner.Id,
            Address = requestData.Address,
            Established = requestData.EstablishedDate,
            Joined = DateTime.UtcNow,
            PhoneNumber = requestData.PhoneNumber,
            CoverImage = placeholderImage,
            NearbyCities = requestData.NearbyCities,
            CourseOffers = [],
            Instructors = [],
            Vehicles = [],
            Courses = [],
        };

        dbContext.Schools.Add(school);
        var written = await dbContext.SaveChangesAsync();

        return written > 0 ? school : null;
    }

    public async Task<ServiceActionResult<UpdateSchoolErrors>> UpdateSchool(
        School school,
        SchoolUpdateRequest requestData,
        SchoolUpdateMode mode
    )
    {
        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            school.Name = requestData.Name;
            school.PhoneNumber = requestData.PhoneNumber;
            school.Email = requestData.Email != school.Owner.Email ? requestData.Email : null;
            school.Email = requestData.Email;
            school.Description = requestData.Description;

            if (requestData.CoverPhoto != null)
            {
                var imageSaveResult = await imageService.SaveImage(requestData.CoverPhoto);

                if (!imageSaveResult.IsSuccess)
                    return new ServiceActionResult<UpdateSchoolErrors>
                    {
                        ErrorCode = UpdateSchoolErrors.InvalidFile,
                        Details = [imageSaveResult.ErrorCode.ToString()],
                    };

                if (school.CoverImage.Id != 1)
                {
                    imageService.DeleteImage(school.CoverImage.FileName);
                    dbContext.Images.Remove(school.CoverImage);
                }

                school.CoverImage = imageSaveResult.Image!;
            }

            if (mode == SchoolUpdateMode.Administrator)
            {
                school.NIP = requestData.Nip;
                var address = await locationService.ComposeAddress(
                    new ComposeAddressData
                    {
                        Street = requestData.Street,
                        BuildingNumber = requestData.BuildingNumber,
                        SubBuildingNumber = requestData.SubBuildingNumber,
                        ZipCode = requestData.ZipCode,
                        City = requestData.City,
                        State = requestData.State,
                    }
                );

                if (!address.IsSuccess)
                    return new ServiceActionResult<UpdateSchoolErrors>
                    {
                        ErrorCode = UpdateSchoolErrors.AddressResolvingError,
                    };

                locationService.DisposeAddress(school.Address);

                school.Address = address.Address!;

                var cities = await locationService.ResolveNearbyCities(
                    requestData.NearbyCities ?? []
                );

                for (var i = 0; i < school.NearbyCities.Count; i++)
                {
                    var city = school.NearbyCities[i];

                    if (!cities.Remove(city))
                    {
                        school.NearbyCities.Remove(city);
                        i--;
                    }
                }

                foreach (var city in cities)
                {
                    if (
                        school.NearbyCities.Find(c =>
                            c.Name == city.Name && c.State.Name == city.State.Name
                        ) == null
                    )
                        school.NearbyCities.Add(city);
                }
            }

            dbContext.Schools.Update(school);

            var written = await dbContext.SaveChangesAsync();

            if (written == 0)
                return new ServiceActionResult<UpdateSchoolErrors>
                {
                    ErrorCode = UpdateSchoolErrors.DbError,
                };

            scope.Complete();

            return new ServiceActionResult<UpdateSchoolErrors> { IsSuccess = true };
        }
    }

    public async Task<ServiceActionResult<ChangeSchoolStateErrors>> SetSchoolVisibility(
        School school,
        bool state
    )
    {
        school.Hidden = !state;

        dbContext.Update(school);

        var written = await dbContext.SaveChangesAsync();
        if (written == 0)
            return new ServiceActionResult<ChangeSchoolStateErrors>
            {
                ErrorCode = ChangeSchoolStateErrors.DbError,
            };

        return new ServiceActionResult<ChangeSchoolStateErrors> { IsSuccess = true };
    }

    public async Task<ServiceActionResult<ChangeSchoolStateErrors>> SetSchoolBlockade(
        School school,
        bool state
    )
    {
        school.Blocked = state;
        if (state)
            school.Hidden = true;

        dbContext.Update(school);

        var written = await dbContext.SaveChangesAsync();
        if (written == 0)
            return new ServiceActionResult<ChangeSchoolStateErrors>
            {
                ErrorCode = ChangeSchoolStateErrors.DbError,
            };

        return new ServiceActionResult<ChangeSchoolStateErrors> { IsSuccess = true };
    }

    public async Task<bool> ValidateSchoolManagementAccess(
        School school,
        string email,
        SchoolManagementAccessMode mode = SchoolManagementAccessMode.OwnerOnly
    )
    {
        var user = await userService.GetUserByEmailAsync(email);

        if (user == null)
            return false;

        return await ValidateSchoolManagementAccess(school, user, mode);
    }

    public async Task<bool> ValidateSchoolManagementAccess(
        School school,
        User user,
        SchoolManagementAccessMode mode = SchoolManagementAccessMode.OwnerOnly
    )
    {
        var ownsSchool = school.Owner.Email == user.Email;

        if (ownsSchool)
            return true;

        if (mode == SchoolManagementAccessMode.OwnerOnly)
            return false;

        var isAdmin = await userService.HasRole(user!, UserRole.Administrator);

        if (isAdmin)
            return true;

        if (mode == SchoolManagementAccessMode.AllPrivileged)
            return false;

        var instructorProfile = await instructorService.GetFromUserAsync(user!);

        if (instructorProfile == null)
            return false;

        var isEmployedInstructor = instructorProfile.ActiveEmployment?.School.Id == school.Id;

        if (isEmployedInstructor)
            return true;

        return false;
    }

    public IEnumerable<Vehicle> GetVehiclesAvailbleAt(
        School school,
        DateTime after,
        DateTime before
    )
    {
        return dbContext
            .Vehicles.Where(v => v.School.Id == school.Id)
            .Where(v => !v.Rides.Any(r => r.StartTime < before && r.EndTime > after));
    }
}

public interface ISchoolService
{
    ValueTask<School?> GetSchoolByID(int id);

    Task<School?> FindExistingSchool(SchoolApplicationData applicationData);

    Task<List<School>> GetAllSchools();

    IQueryable<School> GetSchools(PagingMetadata meta, out int appliedPageSize);

    IQueryable<School> PrepareQuery();

    IQueryable<School> GetPageAsync(
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<School>? queryable = null
    );

    Task<int> Count();

    Task<School?> CreateSchool(SchoolData requestData);

    Task<ServiceActionResult<UpdateSchoolErrors>> UpdateSchool(
        School school,
        SchoolUpdateRequest requestData,
        SchoolUpdateMode mode
    );

    Task<ServiceActionResult<ChangeSchoolStateErrors>> SetSchoolVisibility(
        School school,
        bool state
    );

    Task<ServiceActionResult<ChangeSchoolStateErrors>> SetSchoolBlockade(School school, bool state);

    Task<bool> ValidateSchoolManagementAccess(
        School school,
        string email,
        SchoolManagementAccessMode mode = SchoolManagementAccessMode.OwnerOnly
    );

    Task<bool> ValidateSchoolManagementAccess(
        School school,
        User user,
        SchoolManagementAccessMode mode = SchoolManagementAccessMode.OwnerOnly
    );

    IEnumerable<Vehicle> GetVehiclesAvailbleAt(School school, DateTime after, DateTime before);
}
