using Microsoft.AspNetCore.Identity;

namespace WheeluAPI.helpers;

public class IdentityRoleSetup {
	private static bool _Initialized = false;

	public static async Task Initialize(IServiceProvider provider) {
		if(_Initialized) return;
		_Initialized = true;

		RoleManager<IdentityRole>? roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();

		if(roleManager == null) throw new ArgumentNullException(nameof(roleManager));

		foreach(var roleName in Enum.GetValues(typeof(UserRole)).Cast<UserRole>()) {
			if((await roleManager.RoleExistsAsync(roleName.ToString()))==false)
				await roleManager.CreateAsync(new IdentityRole(roleName.ToString()));
		}

	}


}