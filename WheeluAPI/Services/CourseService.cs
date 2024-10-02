using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class CourseService(ApplicationDbContext dbContext) : BaseService
{
    public Task<List<Course>> GetCoursesAsync(School? school = null)
    {
        if (school == null)
            return dbContext.Courses.ToListAsync();

        return dbContext
            .Courses.Where(c => c.School.Id == school.Id)
            .Where(c => c.TransactionComplete)
            .ToListAsync();
    }

    public IQueryable<Course> GetCoursesPageAsync(PagingMetadata meta, out int appliedPageSize)
    {
        var results = ApplyPaging(
            dbContext.Courses.AsQueryable().Where(c => c.TransactionComplete),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public ValueTask<Course?> GetCourseByIDAsync(int id)
    {
        return dbContext.Courses.FindAsync(id);
    }

    public Task<int> CountAsync(School? school = null)
    {
        var query = dbContext.Courses.AsQueryable();

        if (school != null)
            query = query.Where(c => c.School == school);

        return query.CountAsync();
    }

    public async Task<ServiceActionWithDataResult<CourseCreationErrors, Course>> CreateCourseAsync(
        CourseData courseData
    )
    {
        var result = new ServiceActionWithDataResult<CourseCreationErrors, Course>();

        if (
            courseData.instructor.ActiveCourses.Count
            >= courseData.instructor.MaximumConcurrentStudents
        )
        {
            result.ErrorCode = CourseCreationErrors.InstructorUnavailable;
            result.Details.Add("Instructor's maximum concurrent students limit reached.");
            return result;
        }

        var course = new Course
        {
            Category = courseData.offer.Category.Id,
            Offer = courseData.offer,
            School = courseData.offer.School,
            Student = courseData.student,
            Instructor = courseData.instructor,
            HoursCount = courseData.offer.HoursCount,
            PricePerHour = courseData.offer.PricePerHour,
            CreatedAt = DateTime.UtcNow,
            Transactions = [],
        };

        dbContext.Courses.Add(course);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = CourseCreationErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = course;
        return result;
    }
}
