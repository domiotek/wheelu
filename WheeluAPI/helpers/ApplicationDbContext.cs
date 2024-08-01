using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WheeluAPI.models;

namespace WheeluAPI.helpers;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): IdentityDbContext<User>(options) {

	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder) {
		configurationBuilder.Properties<DateTime>().HaveConversion(typeof(UtcValueConverter));
	}


	class UtcValueConverter: ValueConverter<DateTime, DateTime> {
		public UtcValueConverter(): base(v=>v, v=>DateTime.SpecifyKind(v, DateTimeKind.Utc)) {}
	}
}