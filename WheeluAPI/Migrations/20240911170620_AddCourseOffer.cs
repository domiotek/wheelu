using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 11, 17, 6, 19, 477, DateTimeKind.Utc).AddTicks(8330));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 7, 19, 39, 43, 445, DateTimeKind.Utc).AddTicks(1663));
        }
    }
}
