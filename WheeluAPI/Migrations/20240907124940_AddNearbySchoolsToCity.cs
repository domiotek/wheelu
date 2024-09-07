using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNearbySchoolsToCity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cities_Schools_SchoolId",
                table: "Cities");

            migrationBuilder.DropIndex(
                name: "IX_Cities_SchoolId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "Cities");

            migrationBuilder.CreateTable(
                name: "CitySchool",
                columns: table => new
                {
                    NearbyCitiesId = table.Column<int>(type: "integer", nullable: false),
                    NearbySchoolsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CitySchool", x => new { x.NearbyCitiesId, x.NearbySchoolsId });
                    table.ForeignKey(
                        name: "FK_CitySchool_Cities_NearbyCitiesId",
                        column: x => x.NearbyCitiesId,
                        principalTable: "Cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CitySchool_Schools_NearbySchoolsId",
                        column: x => x.NearbySchoolsId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 7, 12, 49, 40, 40, DateTimeKind.Utc).AddTicks(1281));

            migrationBuilder.CreateIndex(
                name: "IX_CitySchool_NearbySchoolsId",
                table: "CitySchool",
                column: "NearbySchoolsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CitySchool");

            migrationBuilder.AddColumn<int>(
                name: "SchoolId",
                table: "Cities",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 7, 12, 46, 44, 948, DateTimeKind.Utc).AddTicks(893));

            migrationBuilder.CreateIndex(
                name: "IX_Cities_SchoolId",
                table: "Cities",
                column: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cities_Schools_SchoolId",
                table: "Cities",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "Id");
        }
    }
}
