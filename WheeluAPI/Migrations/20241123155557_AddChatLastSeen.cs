using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddChatLastSeen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeen",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 11, 23, 15, 55, 55, 547, DateTimeKind.Utc).AddTicks(5472));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastSeen",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 11, 22, 22, 7, 58, 78, DateTimeKind.Utc).AddTicks(8903));
        }
    }
}
