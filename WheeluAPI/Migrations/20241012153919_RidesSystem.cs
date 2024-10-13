using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class RidesSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HoursCount",
                table: "Courses",
                newName: "BaseHoursCount");

            migrationBuilder.CreateTable(
                name: "CanceledRide",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<string>(type: "text", nullable: true),
                    InstructorId = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    CanceledById = table.Column<string>(type: "text", nullable: true),
                    CanceledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CanceledRide", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CanceledRide_AspNetUsers_CanceledById",
                        column: x => x.CanceledById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CanceledRide_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CanceledRide_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CanceledRide_SchoolInstructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "SchoolInstructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CanceledRide_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<string>(type: "text", nullable: true),
                    InstructorId = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VehicleId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rides_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rides_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Rides_SchoolInstructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "SchoolInstructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Rides_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RideSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InstructorId = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RideId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RideSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RideSlots_Rides_RideId",
                        column: x => x.RideId,
                        principalTable: "Rides",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RideSlots_SchoolInstructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "SchoolInstructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 12, 15, 39, 17, 640, DateTimeKind.Utc).AddTicks(5261));

            migrationBuilder.CreateIndex(
                name: "IX_CanceledRide_CanceledById",
                table: "CanceledRide",
                column: "CanceledById");

            migrationBuilder.CreateIndex(
                name: "IX_CanceledRide_CourseId",
                table: "CanceledRide",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CanceledRide_InstructorId",
                table: "CanceledRide",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_CanceledRide_StudentId",
                table: "CanceledRide",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_CanceledRide_VehicleId",
                table: "CanceledRide",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Rides_CourseId",
                table: "Rides",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Rides_InstructorId",
                table: "Rides",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_Rides_StudentId",
                table: "Rides",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Rides_VehicleId",
                table: "Rides",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_RideSlots_InstructorId",
                table: "RideSlots",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_RideSlots_RideId",
                table: "RideSlots",
                column: "RideId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CanceledRide");

            migrationBuilder.DropTable(
                name: "RideSlots");

            migrationBuilder.DropTable(
                name: "Rides");

            migrationBuilder.RenameColumn(
                name: "BaseHoursCount",
                table: "Courses",
                newName: "HoursCount");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 2, 10, 2, 51, 66, DateTimeKind.Utc).AddTicks(1945));
        }
    }
}
