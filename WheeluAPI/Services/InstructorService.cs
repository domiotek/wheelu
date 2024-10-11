using Microsoft.EntityFrameworkCore;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class InstructorService(ApplicationDbContext dbContext) : BaseService, IInstructorService
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

    public ValueTask<Instructor?> GetByIDAsync(int id)
    {
        return dbContext.Instructors.FindAsync(id);
    }
}

public interface IInstructorService
{
    Task<Instructor?> CreateProfileAsync(User user);

    Task<Instructor?> GetFromUserAsync(User user);

    ValueTask<Instructor?> GetByIDAsync(int id);
}
