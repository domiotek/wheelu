using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class BetterCourseOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseCategory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    RequiredAge = table.Column<int>(type: "integer", nullable: true),
                    SpecialRequirements = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    HoursCount = table.Column<int>(type: "integer", nullable: false),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    PricePerHour = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseOffers_CourseCategory_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "CourseCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseOffers_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "CourseCategory",
                columns: new[] { "Id", "Name", "RequiredAge", "SpecialRequirements" },
                values: new object[,]
                {
                    { 0, "AM", 14, false },
                    { 1, "A", null, true },
                    { 2, "A1", 16, false },
                    { 3, "A2", 18, false },
                    { 4, "B", 18, false },
                    { 5, "B1", 16, false },
                    { 6, "C", 21, false },
                    { 7, "C1", 18, false },
                    { 8, "D", 24, false },
                    { 9, "D1", 21, false },
                    { 10, "T", 16, false }
                });

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 8, 28, 47, 879, DateTimeKind.Utc).AddTicks(5613));

            migrationBuilder.CreateIndex(
                name: "IX_CourseOffers_CategoryId",
                table: "CourseOffers",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseOffers_SchoolId",
                table: "CourseOffers",
                column: "SchoolId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseOffers");

            migrationBuilder.DropTable(
                name: "CourseCategory");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 11, 17, 6, 19, 477, DateTimeKind.Utc).AddTicks(8330));
        }
    }
}
