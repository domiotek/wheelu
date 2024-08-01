using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using WheeluAPI.helpers;
using WheeluAPI.models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson(
	options => {
		options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
		options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
    }
);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options=>{
	options.UseNpgsql(builder.Configuration.GetConnectionString("DBContext"));
});

builder.Services.AddAuthorization();
builder.Services
	.AddIdentity<User, IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>();


builder.Services.AddAuthentication(options=> {
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options=>{
	var key = Encoding.ASCII.GetBytes(builder.Configuration["JWT:Secret"] ?? "");

	options.TokenValidationParameters = new TokenValidationParameters {
		ValidateIssuer = true,
		ValidateAudience = false,
		ValidateIssuerSigningKey = true,
		ValidIssuer = builder.Configuration["JWT:Issuer"],
		IssuerSigningKey = new SymmetricSecurityKey(key)
	};
});

builder.Services.AddScoped<IJwtHandler, JwtHandler>();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowSpecificOrigin",
		builder => {
			builder
				.AllowAnyHeader()
				.AllowAnyMethod()
				.AllowCredentials()
				.WithOrigins("http://localhost:5173",
							 "https://localhost:5173");
		});
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

app.UseStaticFiles(new StaticFileOptions {
	FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "static")),
	RequestPath = "/static"
});

using (var scope = app.Services.CreateScope()) {
	DBSetup.Initialize(scope.ServiceProvider, builder.Configuration).Wait();
}

app.MapControllers();

app.Run();
