using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNearbyCitiesToSchool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 3, 19, 48, 7, 243, DateTimeKind.Utc).AddTicks(5765));
        }
    }
}
