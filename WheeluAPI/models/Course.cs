using System.ComponentModel.DataAnnotations.Schema;
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

    [NotMapped]
    public double UsedHours
    {
        get
        {

            return Rides.Where(x => x.Status == RideStatus.Finished).Sum(x => x.HoursCount);
        }
    }

    public required int BaseHoursCount { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public virtual required List<Transaction> Transactions { get; set; }

    [NotMapped]
    public bool Archived
    {
        get { return false; }
    }

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
}
