using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WheeluAPI.models;
using WheeluAPI.Models;

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

    public DbSet<Image> Images { get; set; }

    public DbSet<CourseOffer> CourseOffers { get; set; }

    public DbSet<CourseCategory> CourseCategories { get; set; }

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
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTime>().HaveConversion(typeof(UtcValueConverter));
    }

    class UtcValueConverter : ValueConverter<DateTime, DateTime>
    {
        public UtcValueConverter()
            : base(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc)) { }
    }
}
