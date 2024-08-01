using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using WheeluAPI.models;

namespace WheeluAPI.helpers;

public interface IJwtHandler {
	public Task<string>  GenerateJwtToken(string username);

	public Task<List<Claim>> GetClaims(string username);
}

public class JwtHandler(IConfiguration configuration, UserManager<User> users): IJwtHandler {

	public async Task<string> GenerateJwtToken(string username) {
		
		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"] ?? ""));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: configuration["JWT:Issuer"],
			claims: await GetClaims(username),
			expires: DateTime.UtcNow.AddDays(5),
			signingCredentials: creds
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	public async Task<List<Claim>> GetClaims(string username) {
		var claims = new List<Claim> 
		{
			new(JwtRegisteredClaimNames.Sub, username),
			new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
		};

		var user = await users.FindByNameAsync(username);

		if(user==null) return [];

		var userRoles = await users.GetRolesAsync(user);

		foreach(var userRole in userRoles) {
			claims.Add(new(ClaimTypes.Role, userRole));
		}

		return claims;
	}
}