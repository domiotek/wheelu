using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public class Course
{
    public int Id { get; set; }

    public bool TransactionComplete { get; set; } = false;

    public required CourseCategoryType Category { get; set; }

    public virtual CourseOffer? Offer { get; set; }

    public virtual required School School { get; set; }

    public virtual required User Student { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public virtual required List<Ride> Rides { get; set; }

    public virtual required List<CanceledRide> CanceledRides { get; set; }

    public virtual List<Exam> Exams { get; set; } = [];

    [NotMapped]
    public double UsedHours
    {
        get { return Rides.Where(x => x.Status == RideStatus.Finished).Sum(x => x.HoursCount); }
    }

    [NotMapped]
    public int HoursCount
    {
        get
        {
            return BaseHoursCount
                + BoughtHoursPackages
                    .Where(p =>
                        p.Transaction == null || p.Transaction.State == TransactionState.Complete
                    )
                    .Sum(i => i.HoursCount);
        }
    }

    public required int BaseHoursCount { get; set; }

    public required decimal PricePerHour { get; set; }

    public virtual required List<HoursPackage> BoughtHoursPackages { get; set; }

    public required DateTime CreatedAt { get; set; }

    public virtual required List<Transaction> Transactions { get; set; }

    public string CourseProgressJSON { get; set; } = "{}";

    public virtual List<Review> Reviews { get; set; } = [];

    [NotMapped]
    public CourseProgress CourseProgress
    {
        get =>
            JsonConvert.DeserializeObject<CourseProgress>(CourseProgressJSON)
            ?? new CourseProgress();
        set => CourseProgressJSON = JsonConvert.SerializeObject(value);
    }

    [NotMapped]
    public bool PassedInternalExam
    {
        get { return Exams.Any(e => e.State == ExamState.Passed); }
    }

    [NotMapped]
    public bool Archived
    {
        get { return false; }
    }

    [NotMapped]
    public Ride? OngoingRide
    {
        get { return Rides.Where(r => r.Status == RideStatus.Ongoing).FirstOrDefault(); }
    }

    [NotMapped]
    public Ride? NextRide
    {
        get
        {
            return Rides
                .Where(r => r.Status == RideStatus.Planned)
                .OrderBy(r => r.StartTime)
                .FirstOrDefault();
        }
    }

    [NotMapped]
    public Exam? NextExam
    {
        get { return Exams.Where(e => e.State == ExamState.Planned).FirstOrDefault(); }
    }
}
