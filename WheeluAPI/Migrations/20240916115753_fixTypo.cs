using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class fixTypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaximumConcurrentStudends",
                table: "SchoolInstructors",
                newName: "MaximumConcurrentStudents");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndTime",
                table: "EmploymentRecord",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 16, 11, 57, 52, 102, DateTimeKind.Utc).AddTicks(3146));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaximumConcurrentStudents",
                table: "SchoolInstructors",
                newName: "MaximumConcurrentStudends");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndTime",
                table: "EmploymentRecord",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 14, 15, 11, 12, 706, DateTimeKind.Utc).AddTicks(2542));
        }
    }
}
