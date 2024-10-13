using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeRideInSlotOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RideSlots_Rides_RideId",
                table: "RideSlots");

            migrationBuilder.AlterColumn<int>(
                name: "RideId",
                table: "RideSlots",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 12, 21, 46, 48, 964, DateTimeKind.Utc).AddTicks(2214));

            migrationBuilder.AddForeignKey(
                name: "FK_RideSlots_Rides_RideId",
                table: "RideSlots",
                column: "RideId",
                principalTable: "Rides",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RideSlots_Rides_RideId",
                table: "RideSlots");

            migrationBuilder.AlterColumn<int>(
                name: "RideId",
                table: "RideSlots",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 12, 15, 39, 17, 640, DateTimeKind.Utc).AddTicks(5261));

            migrationBuilder.AddForeignKey(
                name: "FK_RideSlots_Rides_RideId",
                table: "RideSlots",
                column: "RideId",
                principalTable: "Rides",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
