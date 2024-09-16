﻿// <auto-generated />
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using WheeluAPI.helpers;

#nullable disable

namespace WheeluAPI.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Proxies:ChangeTracking", false)
                .HasAnnotation("Proxies:CheckEquality", false)
                .HasAnnotation("Proxies:LazyLoading", true)
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("CitySchool", b =>
                {
                    b.Property<int>("NearbyCitiesId")
                        .HasColumnType("integer");

                    b.Property<int>("NearbySchoolsId")
                        .HasColumnType("integer");

                    b.HasKey("NearbyCitiesId", "NearbySchoolsId");

                    b.HasIndex("NearbySchoolsId");

                    b.ToTable("CitySchool");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("text");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("text");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .HasColumnType("text");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Value")
                        .HasColumnType("text");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("WheeluAPI.Models.CourseCategory", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("RequiredAge")
                        .HasColumnType("integer");

                    b.Property<int?>("SchoolInstructorId")
                        .HasColumnType("integer");

                    b.Property<bool>("SpecialRequirements")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("SchoolInstructorId");

                    b.ToTable("CourseCategories");

                    b.HasData(
                        new
                        {
                            Id = 0,
                            Name = "AM",
                            RequiredAge = 14,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 1,
                            Name = "A",
                            SpecialRequirements = true
                        },
                        new
                        {
                            Id = 2,
                            Name = "A1",
                            RequiredAge = 16,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 3,
                            Name = "A2",
                            RequiredAge = 18,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 4,
                            Name = "B",
                            RequiredAge = 18,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 5,
                            Name = "B1",
                            RequiredAge = 16,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 6,
                            Name = "C",
                            RequiredAge = 21,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 7,
                            Name = "C1",
                            RequiredAge = 18,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 8,
                            Name = "D",
                            RequiredAge = 24,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 9,
                            Name = "D1",
                            RequiredAge = 21,
                            SpecialRequirements = false
                        },
                        new
                        {
                            Id = 10,
                            Name = "T",
                            RequiredAge = 16,
                            SpecialRequirements = false
                        });
                });

            modelBuilder.Entity("WheeluAPI.Models.CourseOffer", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("CategoryId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("Enabled")
                        .HasColumnType("boolean");

                    b.Property<int>("HoursCount")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LastUpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric");

                    b.Property<decimal>("PricePerHour")
                        .HasColumnType("numeric");

                    b.Property<int>("SchoolId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("SchoolId");

                    b.ToTable("CourseOffers");
                });

            modelBuilder.Entity("WheeluAPI.Models.EmploymentRecord", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime?>("EndTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("InstructorId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("InstructorId");

                    b.ToTable("EmploymentRecord");
                });

            modelBuilder.Entity("WheeluAPI.Models.Instructor", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Instructors");
                });

            modelBuilder.Entity("WheeluAPI.Models.InstructorInviteToken", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("TargetSchoolId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("TargetSchoolId");

                    b.ToTable("InstructorInviteTokens");
                });

            modelBuilder.Entity("WheeluAPI.Models.SchoolInstructor", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<bool>("Detached")
                        .HasColumnType("boolean");

                    b.Property<int>("InstructorId")
                        .HasColumnType("integer");

                    b.Property<int>("MaximumConcurrentStudents")
                        .HasColumnType("integer");

                    b.Property<int>("SchoolId")
                        .HasColumnType("integer");

                    b.Property<bool>("Visible")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("InstructorId");

                    b.HasIndex("SchoolId");

                    b.ToTable("SchoolInstructors");
                });

            modelBuilder.Entity("WheeluAPI.models.AccountToken", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("TokenType")
                        .HasColumnType("integer");

                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AccountTokens");
                });

            modelBuilder.Entity("WheeluAPI.models.Address", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("BuildingNumber")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Street")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("SubBuildingNumber")
                        .HasColumnType("integer");

                    b.Property<int>("ZipCodeId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ZipCodeId");

                    b.ToTable("Addresses");
                });

            modelBuilder.Entity("WheeluAPI.models.City", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("StateId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("StateId");

                    b.ToTable("Cities");
                });

            modelBuilder.Entity("WheeluAPI.models.Image", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("FileName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("UploadDate")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.ToTable("Images");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            FileName = "placeholder.png",
                            UploadDate = new DateTime(2024, 9, 16, 11, 57, 52, 102, DateTimeKind.Utc).AddTicks(3146)
                        });
                });

            modelBuilder.Entity("WheeluAPI.models.School", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AddressId")
                        .HasColumnType("integer");

                    b.Property<bool>("Blocked")
                        .HasColumnType("boolean");

                    b.Property<int>("CoverImageId")
                        .HasColumnType("integer");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<DateOnly>("Established")
                        .HasColumnType("date");

                    b.Property<bool>("Hidden")
                        .HasColumnType("boolean");

                    b.Property<DateTime>("Joined")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("NIP")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("OwnerId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PhoneNumber")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AddressId");

                    b.HasIndex("CoverImageId");

                    b.HasIndex("OwnerId")
                        .IsUnique();

                    b.ToTable("Schools");
                });

            modelBuilder.Entity("WheeluAPI.models.SchoolApplication", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("AppliedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("BuildingNumber")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("City")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateOnly>("Established")
                        .HasColumnType("date");

                    b.Property<string>("NIP")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<List<string>>("NearbyCities")
                        .IsRequired()
                        .HasColumnType("text[]");

                    b.Property<DateOnly>("OwnerBirthday")
                        .HasColumnType("date");

                    b.Property<string>("OwnerName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("OwnerSurname")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PhoneNumber")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("RejectionMessage")
                        .HasColumnType("text");

                    b.Property<int?>("RejectionReason")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("ResolvedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("State")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<string>("Street")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("SubBuildingNumber")
                        .HasColumnType("integer");

                    b.Property<string>("ZipCode")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("SchoolApplications");
                });

            modelBuilder.Entity("WheeluAPI.models.State", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("States");
                });

            modelBuilder.Entity("WheeluAPI.models.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("integer");

                    b.Property<DateOnly>("Birthday")
                        .HasColumnType("date");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("boolean");

                    b.Property<DateTime>("LastPasswordChange")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("boolean");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("text");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("text");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("text");

                    b.Property<string>("Surname")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("boolean");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("WheeluAPI.models.ZipCode", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("CityId")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("CityId");

                    b.ToTable("ZipCodes");
                });

            modelBuilder.Entity("CitySchool", b =>
                {
                    b.HasOne("WheeluAPI.models.City", null)
                        .WithMany()
                        .HasForeignKey("NearbyCitiesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.School", null)
                        .WithMany()
                        .HasForeignKey("NearbySchoolsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("WheeluAPI.models.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("WheeluAPI.models.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("WheeluAPI.models.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WheeluAPI.Models.CourseCategory", b =>
                {
                    b.HasOne("WheeluAPI.Models.SchoolInstructor", null)
                        .WithMany("AllowedCategories")
                        .HasForeignKey("SchoolInstructorId");
                });

            modelBuilder.Entity("WheeluAPI.Models.CourseOffer", b =>
                {
                    b.HasOne("WheeluAPI.Models.CourseCategory", "Category")
                        .WithMany("CourseOffers")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.School", "School")
                        .WithMany("CourseOffers")
                        .HasForeignKey("SchoolId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("School");
                });

            modelBuilder.Entity("WheeluAPI.Models.EmploymentRecord", b =>
                {
                    b.HasOne("WheeluAPI.Models.SchoolInstructor", "Instructor")
                        .WithMany("EmploymentRecords")
                        .HasForeignKey("InstructorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Instructor");
                });

            modelBuilder.Entity("WheeluAPI.Models.Instructor", b =>
                {
                    b.HasOne("WheeluAPI.models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WheeluAPI.Models.InstructorInviteToken", b =>
                {
                    b.HasOne("WheeluAPI.models.School", "TargetSchool")
                        .WithMany()
                        .HasForeignKey("TargetSchoolId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("TargetSchool");
                });

            modelBuilder.Entity("WheeluAPI.Models.SchoolInstructor", b =>
                {
                    b.HasOne("WheeluAPI.Models.Instructor", "Instructor")
                        .WithMany("EmploymentHistory")
                        .HasForeignKey("InstructorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.School", "School")
                        .WithMany("Instructors")
                        .HasForeignKey("SchoolId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Instructor");

                    b.Navigation("School");
                });

            modelBuilder.Entity("WheeluAPI.models.AccountToken", b =>
                {
                    b.HasOne("WheeluAPI.models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WheeluAPI.models.Address", b =>
                {
                    b.HasOne("WheeluAPI.models.ZipCode", "ZipCode")
                        .WithMany()
                        .HasForeignKey("ZipCodeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ZipCode");
                });

            modelBuilder.Entity("WheeluAPI.models.City", b =>
                {
                    b.HasOne("WheeluAPI.models.State", "State")
                        .WithMany("Cities")
                        .HasForeignKey("StateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("State");
                });

            modelBuilder.Entity("WheeluAPI.models.School", b =>
                {
                    b.HasOne("WheeluAPI.models.Address", "Address")
                        .WithMany()
                        .HasForeignKey("AddressId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.Image", "CoverImage")
                        .WithMany()
                        .HasForeignKey("CoverImageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WheeluAPI.models.User", "Owner")
                        .WithOne("OwnedSchool")
                        .HasForeignKey("WheeluAPI.models.School", "OwnerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Address");

                    b.Navigation("CoverImage");

                    b.Navigation("Owner");
                });

            modelBuilder.Entity("WheeluAPI.models.ZipCode", b =>
                {
                    b.HasOne("WheeluAPI.models.City", "City")
                        .WithMany("ZipCodes")
                        .HasForeignKey("CityId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("City");
                });

            modelBuilder.Entity("WheeluAPI.Models.CourseCategory", b =>
                {
                    b.Navigation("CourseOffers");
                });

            modelBuilder.Entity("WheeluAPI.Models.Instructor", b =>
                {
                    b.Navigation("EmploymentHistory");
                });

            modelBuilder.Entity("WheeluAPI.Models.SchoolInstructor", b =>
                {
                    b.Navigation("AllowedCategories");

                    b.Navigation("EmploymentRecords");
                });

            modelBuilder.Entity("WheeluAPI.models.City", b =>
                {
                    b.Navigation("ZipCodes");
                });

            modelBuilder.Entity("WheeluAPI.models.School", b =>
                {
                    b.Navigation("CourseOffers");

                    b.Navigation("Instructors");
                });

            modelBuilder.Entity("WheeluAPI.models.State", b =>
                {
                    b.Navigation("Cities");
                });

            modelBuilder.Entity("WheeluAPI.models.User", b =>
                {
                    b.Navigation("OwnedSchool");
                });
#pragma warning restore 612, 618
        }
    }
}
