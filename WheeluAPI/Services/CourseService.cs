using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Transaction;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class CourseService(
    ApplicationDbContext dbContext,
    IMailService mailService,
    UrlResolver urlHelper,
    TransactionService transactionService
) : BaseService
{
    private async void SendInstructorChangedEmailsAsync(
        Course course,
        SchoolInstructor prevInstructor
    )
    {
        var template = mailService.GetTemplate<CourseInstructorChangedTemplateVariables>(
            "course-instructor-changed"
        );

        var link = $"{urlHelper.GetClientUrl()}/courses/{course.Id}";

        var receipients = new List<CourseInstructorChangedTemplateVariables>
        {
            new()
            {
                FirstName = course.Student.Name,
                Message =
                    "Otrzymujesz tę wiadomość, ponieważ w Twoim kursie zmienił się instruktor prowadzący.",
                Link = link,
                Email = course.Student.Email!,
            },
            new()
            {
                FirstName = course.Instructor.Instructor.User.Name,
                Message =
                    "Otrzymujesz tę wiadomość, ponieważ zostałeś/aś przypisany do kursu jako instruktor prowadzący.",
                Link = link,
                Email = course.Instructor.Instructor.User.Email!,
            },
            new()
            {
                FirstName = prevInstructor.Instructor.User.Name,
                Message =
                    "Otrzymujesz tę wiadomość, ponieważ zostałeś/aś odłączony od kursu, który prowadziłeś/aś.",
                Link = link,
                Email = prevInstructor.Instructor.User.Email!,
            },
        };

        foreach (var receipient in receipients)
        {
            await mailService.SendEmail(
                "generic",
                template!.Populate(receipient),
                [receipient.Email]
            );
        }
    }

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

    public async Task<
        ServiceActionWithDataResult<CoursePurchaseErrors, CreateTransactionResponse>
    > ProcessCoursePurchaseRequest(
        User student,
        SchoolInstructor instructor,
        CourseOffer offer,
        decimal ClientTotalAmount
    )
    {
        var result =
            new ServiceActionWithDataResult<CoursePurchaseErrors, CreateTransactionResponse>();

        var courseResult = await CreateCourseAsync(
            new CourseData
            {
                student = student,
                instructor = instructor,
                offer = offer,
            }
        );

        if (!courseResult.IsSuccess)
        {
            result.ErrorCode = (CoursePurchaseErrors)courseResult.ErrorCode;
            result.Details = courseResult.Details;
            return result;
        }

        var transactionItems = new List<TransactionItem>
        {
            new()
            {
                Type = TransactionItemType.Course,
                Name = $"Kurs {offer.Category.Name}",
                Quantity = 1,
                Total = offer.Price,
                RelatedId = offer.Id,
            },
        };

        var transactionCreateRequest = new CreateTransactionRequest
        {
            Description = $"Kurs kategorii {offer.Category.Name} na Wheelu.",
            ClientTotalAmount = ClientTotalAmount,
            Payer = student,
            Course = courseResult.Data!,
            Items = transactionItems,
        };

        var transactionResult = await transactionService.CreateTransaction(
            transactionCreateRequest
        );

        if (!transactionResult.IsSuccess)
        {
            result.ErrorCode = (CoursePurchaseErrors)transactionResult.ErrorCode;
            result.Details = result.Details;
            return result;
        }

        result.IsSuccess = true;
        result.Data = transactionResult.Data;
        return result;
    }

    public async Task<
        ServiceActionWithDataResult<CourseHoursPurchaseErrors, CreateTransactionResponse>
    > ProcessHoursPurchaseRequest(Course course, BuyHoursRequest request)
    {
        var result =
            new ServiceActionWithDataResult<CourseHoursPurchaseErrors, CreateTransactionResponse>();

        var package = await CreateHoursPackageAsync(course, request.HoursCount);

        if (package == null)
        {
            result.ErrorCode = CourseHoursPurchaseErrors.DbError;
            result.Details = ["Couldn't create hours package."];
            return result;
        }

        var transactionItems = new List<TransactionItem>
        {
            new()
            {
                Type = TransactionItemType.AdditionalHour,
                Name = $"Dodatkowa godzina jazdy",
                Quantity = request.HoursCount,
                Total = request.HoursCount * course.PricePerHour,
                RelatedId = package.Id,
            },
        };

        var transactionCreateRequest = new CreateTransactionRequest
        {
            Description = $"Dodatkowe godziny w kursie kategorii {course.Category} na Wheelu.",
            ClientTotalAmount = request.TotalAmount,
            Payer = course.Student,
            Course = course,
            Items = transactionItems,
        };

        var transactionResult = await transactionService.CreateTransaction(
            transactionCreateRequest
        );

        if (!transactionResult.IsSuccess)
        {
            result.ErrorCode = (CourseHoursPurchaseErrors)transactionResult.ErrorCode;
            result.Details = result.Details;
            return result;
        }

        package.Transaction = transactionResult.Data!.Transaction;
        dbContext.HoursPackages.Update(package);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = CourseHoursPurchaseErrors.DbError;
            result.Details = ["Couldn't update hours package"];
            return result;
        }

        result.IsSuccess = true;
        result.Data = transactionResult.Data;
        return result;
    }

    public async Task<ServiceActionWithDataResult<CourseCreationErrors, Course>> CreateCourseAsync(
        CourseData courseData
    )
    {
        var result = new ServiceActionWithDataResult<CourseCreationErrors, Course>();

        if (courseData.offer.School.Blocked)
        {
            result.ErrorCode = CourseCreationErrors.SchoolBlocked;
            return result;
        }

        if (!courseData.instructor.Visible)
        {
            result.ErrorCode = CourseCreationErrors.InstructorUnavailable;
            return result;
        }

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
            BaseHoursCount = courseData.offer.HoursCount,
            PricePerHour = courseData.offer.PricePerHour,
            BoughtHoursPackages = [],
            CreatedAt = DateTime.UtcNow,
            Transactions = [],
            Rides = [],
            CanceledRides = [],
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

    public async Task<HoursPackage?> CreateHoursPackageAsync(Course course, int hoursCount)
    {
        var package = new HoursPackage
        {
            Course = course,
            HoursCount = hoursCount,
            Created = DateTime.UtcNow,
        };

        dbContext.HoursPackages.Add(package);

        return await dbContext.SaveChangesAsync() > 0 ? package : null;
    }

    public async Task<ServiceActionResult<ChangeInstructorErrors>> ChangeCourseInstructorAsync(
        Course course,
        SchoolInstructor schoolInstructor,
        bool disableInstructorMaxCourseCountRestriction = false
    )
    {
        var result = new ServiceActionResult<ChangeInstructorErrors>();

        if (schoolInstructor.School.Id != course.School.Id)
        {
            result.ErrorCode = ChangeInstructorErrors.ExternalInstructor;
            result.Details = ["Instructor is not part of the school"];

            return result;
        }

        if (
            schoolInstructor.ActiveCourses.Count >= schoolInstructor.MaximumConcurrentStudents
            && !disableInstructorMaxCourseCountRestriction
        )
        {
            result.ErrorCode = ChangeInstructorErrors.InstructorUnavailable;
            result.Details.Add("Instructor's maximum concurrent students limit reached.");
            return result;
        }

        if (course.OngoingRide != null)
        {
            result.ErrorCode = ChangeInstructorErrors.RideOngoing;
            return result;
        }

        if (course.NextRide != null)
        {
            result.ErrorCode = ChangeInstructorErrors.RidesPlanned;
            return result;
        }
        var prevInstructor = course.Instructor;
        course.Instructor = schoolInstructor;

        dbContext.Courses.Update(course);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = ChangeInstructorErrors.DbError;
            return result;
        }

        SendInstructorChangedEmailsAsync(course, prevInstructor);

        result.IsSuccess = true;
        return result;
    }
}
