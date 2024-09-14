using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SchoolInstructorId",
                table: "CourseCategories",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InstructorInviteTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetSchoolId = table.Column<int>(type: "integer", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorInviteTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InstructorInviteTokens_Schools_TargetSchoolId",
                        column: x => x.TargetSchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Instructors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instructors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Instructors_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SchoolInstructors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InstructorId = table.Column<int>(type: "integer", nullable: false),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    Detached = table.Column<bool>(type: "boolean", nullable: false),
                    Visible = table.Column<bool>(type: "boolean", nullable: false),
                    MaximumConcurrentStudends = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolInstructors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolInstructors_Instructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "Instructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SchoolInstructors_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentRecord",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InstructorId = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentRecord", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmploymentRecord_SchoolInstructors_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "SchoolInstructors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 0,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 4,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 5,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 6,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 7,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 8,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 9,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "CourseCategories",
                keyColumn: "Id",
                keyValue: 10,
                column: "SchoolInstructorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 14, 15, 11, 12, 706, DateTimeKind.Utc).AddTicks(2542));

            migrationBuilder.CreateIndex(
                name: "IX_CourseCategories_SchoolInstructorId",
                table: "CourseCategories",
                column: "SchoolInstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentRecord_InstructorId",
                table: "EmploymentRecord",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorInviteTokens_TargetSchoolId",
                table: "InstructorInviteTokens",
                column: "TargetSchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Instructors_UserId",
                table: "Instructors",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolInstructors_InstructorId",
                table: "SchoolInstructors",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolInstructors_SchoolId",
                table: "SchoolInstructors",
                column: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseCategories_SchoolInstructors_SchoolInstructorId",
                table: "CourseCategories",
                column: "SchoolInstructorId",
                principalTable: "SchoolInstructors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseCategories_SchoolInstructors_SchoolInstructorId",
                table: "CourseCategories");

            migrationBuilder.DropTable(
                name: "EmploymentRecord");

            migrationBuilder.DropTable(
                name: "InstructorInviteTokens");

            migrationBuilder.DropTable(
                name: "SchoolInstructors");

            migrationBuilder.DropTable(
                name: "Instructors");

            migrationBuilder.DropIndex(
                name: "IX_CourseCategories_SchoolInstructorId",
                table: "CourseCategories");

            migrationBuilder.DropColumn(
                name: "SchoolInstructorId",
                table: "CourseCategories");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 18, 22, 12, 307, DateTimeKind.Utc).AddTicks(5573));
        }
    }
}
