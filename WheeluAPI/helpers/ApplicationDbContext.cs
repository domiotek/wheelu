using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.models;
using WheeluAPI.Models;
using WheeluAPI.Models.Chat;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.helpers;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<City> Cities { get; set; }

    public DbSet<State> States { get; set; }

    public DbSet<ZipCode> ZipCodes { get; set; }

    public DbSet<Address> Addresses { get; set; }

    public DbSet<School> Schools { get; set; }

    public DbSet<SchoolApplication> SchoolApplications { get; set; }

    public DbSet<AccountToken> AccountTokens { get; set; }

    public DbSet<InstructorInviteToken> InstructorInviteTokens { get; set; }

    public DbSet<Image> Images { get; set; }

    public DbSet<CourseOffer> CourseOffers { get; set; }

    public DbSet<CourseCategory> CourseCategories { get; set; }

    public DbSet<Instructor> Instructors { get; set; }

    public DbSet<SchoolInstructor> SchoolInstructors { get; set; }

    public DbSet<VehiclePartType> VehiclePartTypes { get; set; }

    public DbSet<Vehicle> Vehicles { get; set; }

    public DbSet<Course> Courses { get; set; }

    public DbSet<Transaction> Transactions { get; set; }

    public DbSet<RideSlot> RideSlots { get; set; }

    public DbSet<Ride> Rides { get; set; }

    public DbSet<CanceledRide> CanceledRides { get; set; }

    public DbSet<InstructorChangeRequest> InstructorChangeRequests { get; set; }

    public DbSet<HoursPackage> HoursPackages { get; set; }

    public DbSet<Exam> Exams { get; set; }

    public DbSet<Review> Reviews { get; set; }

    public DbSet<Conversation> Conversations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<IdentityUserLogin<string>>()
            .HasKey(login => new { login.LoginProvider, login.ProviderKey });

        modelBuilder
            .Entity<Image>()
            .HasData(
                [
                    new Image
                    {
                        Id = 1,
                        FileName = "placeholder.png",
                        UploadDate = DateTime.UtcNow,
                    },
                ]
            );

        modelBuilder
            .Entity<CourseCategory>()
            .HasData(
                [
                    new CourseCategory
                    {
                        Id = CourseCategoryType.AM,
                        Name = "AM",
                        RequiredAge = 14,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.A,
                        Name = "A",
                        SpecialRequirements = true,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.A1,
                        Name = "A1",
                        RequiredAge = 16,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.A2,
                        Name = "A2",
                        RequiredAge = 18,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.B,
                        Name = "B",
                        RequiredAge = 18,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.B1,
                        Name = "B1",
                        RequiredAge = 16,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.C,
                        Name = "C",
                        RequiredAge = 21,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.C1,
                        Name = "C1",
                        RequiredAge = 18,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.D,
                        Name = "D",
                        RequiredAge = 24,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.D1,
                        Name = "D1",
                        RequiredAge = 21,
                        CourseOffers = [],
                    },
                    new CourseCategory
                    {
                        Id = CourseCategoryType.T,
                        Name = "T",
                        RequiredAge = 16,
                        CourseOffers = [],
                    },
                ]
            );

        modelBuilder
            .Entity<VehiclePartType>()
            .HasData(
                [
                    new VehiclePartType { Id = VehiclePartTypeId.Tires, LifespanInDays = 1095 },
                    new VehiclePartType { Id = VehiclePartTypeId.Brakes, LifespanInDays = 365 },
                    new VehiclePartType { Id = VehiclePartTypeId.Clutch, LifespanInDays = 730 },
                    new VehiclePartType
                    {
                        Id = VehiclePartTypeId.Suspension,
                        LifespanInDays = 1825,
                    },
                    new VehiclePartType { Id = VehiclePartTypeId.Oil, LifespanInDays = 90 },
                    new VehiclePartType { Id = VehiclePartTypeId.Igniters, LifespanInDays = 730 },
                    new VehiclePartType { Id = VehiclePartTypeId.Battery, LifespanInDays = 1095 },
                    new VehiclePartType { Id = VehiclePartTypeId.Ligths, LifespanInDays = 1095 },
                ]
            );

        modelBuilder.Entity<LastReadMessage>(entity =>
        {
            entity.HasKey(lrm => new { lrm.ChatMemberId, lrm.ChatMessageId });

            entity
                .HasOne(lrm => lrm.ChatMember)
                .WithMany()
                .HasForeignKey(lrm => lrm.ChatMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(lrm => lrm.ChatMessage)
                .WithMany()
                .HasForeignKey(lrm => lrm.ChatMessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
