using Microsoft.AspNetCore.Identity;
using WheeluAPI.models;

namespace WheeluAPI.helpers;

public class DBSetup {
	private static bool _Initialized = false;

	public static async Task Initialize(IServiceProvider provider, IConfiguration configuration) {
		if(_Initialized) return;
		_Initialized = true;

		RoleManager<IdentityRole>? roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();

		if(roleManager == null) throw new NullReferenceException(nameof(roleManager));

		foreach(var roleName in Enum.GetValues(typeof(UserRole)).Cast<UserRole>()) {
			if((await roleManager.RoleExistsAsync(roleName.ToString()))==false)
				await roleManager.CreateAsync(new IdentityRole(roleName.ToString()));
		}

		UserManager<User>? userManager = provider.GetRequiredService<UserManager<User>>();

		if(userManager == null) throw new NullReferenceException(nameof(userManager));

		
		string adminAccountMode = configuration["Administrator:Mode"] ?? "off";

		if(adminAccountMode != "off") {
			string targetEmail = configuration["Administrator:Email"] ?? throw new NullReferenceException("Failed creating admin account. No Email provided.");

			if(await userManager.FindByEmailAsync(targetEmail)==null) {
				var newUser = new User {
					Email = configuration["Administrator:Email"],
					UserName = configuration["Administrator:Email"],
					Name = configuration["Administrator:Name"] ?? "",
					Surname = configuration["Administrator:Surname"] ?? "",
					CreatedAt = DateTime.UtcNow
				};

				string password = configuration["Administrator:Password"] ?? throw new NullReferenceException("Failed creating admin account. No Password provided.");

				var result = await userManager.CreateAsync(newUser, password);

				if(result.Succeeded) {
					result = await userManager.AddToRoleAsync(newUser, UserRole.Administrator.ToString());

					if(result.Succeeded) Console.WriteLine("[Administrator Account Configuration] Successfully configured administrator account.");
					else await userManager.DeleteAsync(newUser);
				}
			}else Console.WriteLine("[Administrator Account Configuration] No action required. Account exists.");
		}

	}

}