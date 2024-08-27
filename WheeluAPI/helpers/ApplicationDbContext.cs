using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WheeluAPI.models;

namespace WheeluAPI.helpers;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): IdentityDbContext<User>(options) {

	public DbSet<City> Cities { get; set; }

	public DbSet<State> States { get; set; }

	public DbSet<ZipCode> ZipCodes { get; set; }

	public DbSet<Address> Addresses { get; set; }

	public DbSet<School> Schools { get; set; }

	public DbSet<SchoolApplication> SchoolApplications { get; set; }

	public DbSet<AccountToken> AccountTokens { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder) {
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<IdentityUserLogin<string>>()
			.HasKey(login => new { login.LoginProvider, login.ProviderKey });
	}

	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder) {
		configurationBuilder.Properties<DateTime>().HaveConversion(typeof(UtcValueConverter));
	}


	class UtcValueConverter: ValueConverter<DateTime, DateTime> {
		public UtcValueConverter(): base(v=>v, v=>DateTime.SpecifyKind(v, DateTimeKind.Utc)) {}
	}
}