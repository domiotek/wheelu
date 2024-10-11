using System.Text;
using DotNetEnv;
using DotNetEnv.Extensions;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Middlewares;
using WheeluAPI.models;
using WheeluAPI.Services;

Env.Load().ToDotEnvDictionary();

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft
            .Json
            .ReferenceLoopHandling
            .Ignore;
        options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("DBContext"))
        .UseLazyLoadingProxies();
});

builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(opts =>
        opts.UseNpgsqlConnection(Env.GetString("HANGFIRE_CONN_STR"))
    )
);
builder.Services.AddHangfireServer();

builder.Services.AddAuthorization();
builder.Services.AddIdentity<User, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>();

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var key = Encoding.ASCII.GetBytes(builder.Configuration["JWT:Secret"] ?? "");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
        };
    });

builder.Services.AddScoped<IJwtHandler, JwtHandler>();
builder.Services.AddScoped<UrlResolver>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<ISchoolApplicationService, SchoolApplicationService>();
builder.Services.AddScoped<ISchoolService, Schoolervice>();
builder.Services.AddSingleton<IMailService, MailService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<ICourseOfferService, CourseOfferService>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IInstructorInviteService, InstructorInviteService>();
builder.Services.AddScoped<ISchoolInstructorService, SchoolInstructorService>();
builder.Services.AddScoped<VehicleService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<TPayService>();

builder.Services.AddScoped<SchoolMapper>();
builder.Services.AddScoped<CourseOfferDTOMapper>();
builder.Services.AddScoped<CourseCategoryDTOMapper>();
builder.Services.AddScoped<InstructorDTOMapper>();
builder.Services.AddScoped<SchoolInstructorDTOMapper>();
builder.Services.AddScoped<VehicleMapper>();
builder.Services.AddScoped<CourseMapper>();
builder.Services.AddScoped<TransactionMapper>();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowSpecificOrigin",
        builder =>
        {
            builder
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins("http://localhost:5173", "https://localhost:5173");
        }
    );
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

app.UseMiddleware<BufferingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "static")
        ),
        RequestPath = "/static",
    }
);

using (var scope = app.Services.CreateScope())
{
    DBSetup.Initialize(scope.ServiceProvider, builder.Configuration).Wait();
}

app.MapControllers();

app.Run();
