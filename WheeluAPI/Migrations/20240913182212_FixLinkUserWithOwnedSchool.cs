using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixLinkUserWithOwnedSchool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Schools_Owner",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_Owner",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Owner",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                table: "Schools",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 18, 22, 12, 307, DateTimeKind.Utc).AddTicks(5573));

            migrationBuilder.CreateIndex(
                name: "IX_Schools_OwnerId",
                table: "Schools",
                column: "OwnerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_AspNetUsers_OwnerId",
                table: "Schools",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schools_AspNetUsers_OwnerId",
                table: "Schools");

            migrationBuilder.DropIndex(
                name: "IX_Schools_OwnerId",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Schools");

            migrationBuilder.AddColumn<int>(
                name: "Owner",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 18, 10, 34, 965, DateTimeKind.Utc).AddTicks(8078));

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_Owner",
                table: "AspNetUsers",
                column: "Owner",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Schools_Owner",
                table: "AspNetUsers",
                column: "Owner",
                principalTable: "Schools",
                principalColumn: "Id");
        }
    }
}
