using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class InstructorChangeRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InstructorChangeRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RequestorId = table.Column<string>(type: "text", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    RequestedInstructorId = table.Column<int>(type: "integer", nullable: true),
                    Note = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastStatusChange = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstructorChangeRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InstructorChangeRequests_AspNetUsers_RequestorId",
                        column: x => x.RequestorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InstructorChangeRequests_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InstructorChangeRequests_SchoolInstructors_RequestedInstruc~",
                        column: x => x.RequestedInstructorId,
                        principalTable: "SchoolInstructors",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 18, 12, 19, 55, 214, DateTimeKind.Utc).AddTicks(7156));

            migrationBuilder.CreateIndex(
                name: "IX_InstructorChangeRequests_CourseId",
                table: "InstructorChangeRequests",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorChangeRequests_RequestedInstructorId",
                table: "InstructorChangeRequests",
                column: "RequestedInstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_InstructorChangeRequests_RequestorId",
                table: "InstructorChangeRequests",
                column: "RequestorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InstructorChangeRequests");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 13, 19, 51, 50, 188, DateTimeKind.Utc).AddTicks(14));
        }
    }
}
