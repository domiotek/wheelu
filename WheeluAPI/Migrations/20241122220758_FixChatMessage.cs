using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixChatMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "ChatMessage",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 11, 22, 22, 7, 58, 78, DateTimeKind.Utc).AddTicks(8903));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Message",
                table: "ChatMessage");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 11, 22, 18, 20, 20, 936, DateTimeKind.Utc).AddTicks(8561));
        }
    }
}
