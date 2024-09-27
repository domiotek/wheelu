using WheeluAPI.DTO.Course;
using WheeluAPI.helpers;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class CourseService(ApplicationDbContext dbContext)
{
    public async Task<Course?> CreateCourse(CourseData courseData)
    {
        var course = new Course
        {
            Category = courseData.offer.Category.Id,
            Offer = courseData.offer,
            School = courseData.offer.School,
            Student = courseData.student,
            Instructor = courseData.instructor,
            HoursCount = courseData.offer.HoursCount,
            PricePerHour = courseData.offer.PricePerHour,
            PurchasedAt = DateTime.UtcNow,
        };

        dbContext.Courses.Add(course);

        return await dbContext.SaveChangesAsync() > 0 ? course : null;
    }
}
