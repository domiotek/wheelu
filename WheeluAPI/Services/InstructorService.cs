using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class InstructorService(
    ApplicationDbContext dbContext,
    ISchoolInstructorService instructorsService
) : BaseService, IInstructorService
{
    public async Task<Instructor?> CreateProfileAsync(User user)
    {
        var instructor = new Instructor { User = user, EmploymentHistory = [] };

        dbContext.Instructors.Add(instructor);

        return await dbContext.SaveChangesAsync() > 0 ? instructor : null;
    }

    public Task<Instructor?> GetFromUserAsync(User user)
    {
        return dbContext.Instructors.Where(i => i.User == user).SingleOrDefaultAsync();
    }

    public InstructorResponse GetDTO(Instructor source)
    {
        return new InstructorResponse
        {
            Id = source.Id,
            User = source.User.GetShortDTO(),
            EmploymentHistory = instructorsService.MapToDTO(source.EmploymentHistory),
        };
    }

    public List<InstructorResponse> MapToDTO(List<Instructor> source)
    {
        return source.Select(GetDTO).ToList();
    }

    public ShortInstructorResponse GetShortDTO(Instructor source)
    {
        return new ShortInstructorResponse { Id = source.Id, User = source.User.GetShortDTO() };
    }

    public List<ShortInstructorResponse> MapToShortDTO(List<Instructor> source)
    {
        return source.Select(GetShortDTO).ToList();
    }
}

public interface IInstructorService
{
    Task<Instructor?> CreateProfileAsync(User user);

    Task<Instructor?> GetFromUserAsync(User user);

    InstructorResponse GetDTO(Instructor source);

    List<InstructorResponse> MapToDTO(List<Instructor> source);

    ShortInstructorResponse GetShortDTO(Instructor source);

    List<ShortInstructorResponse> MapToShortDTO(List<Instructor> source);
}
