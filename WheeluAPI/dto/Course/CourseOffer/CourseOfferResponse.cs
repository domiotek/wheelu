using WheeluAPI.DTO.Instructor;
using WheeluAPI.DTO.Vehicle;

namespace WheeluAPI.DTO.Course.CourseOffer;

public class CourseOfferResponse
{
    public int Id { get; set; }

    public required CourseCategoryResponse Category { get; set; }

    public required bool Enabled { get; set; }

    public required int HoursCount { get; set; }

    public required decimal Price { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required DateTime LastUpdatedAt { get; set; }

    public required List<ShortSchoolInstructorResponse> Instructors { get; set; }

    public required List<ShortVehicleResponse> Vehicles { get; set; }
}
