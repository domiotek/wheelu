using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class ChangesToApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cities_SchoolApplications_SchoolApplicationId",
                table: "Cities");

            migrationBuilder.DropForeignKey(
                name: "FK_SchoolApplications_Address_AddressId",
                table: "SchoolApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode");

            migrationBuilder.DropIndex(
                name: "IX_SchoolApplications_AddressId",
                table: "SchoolApplications");

            migrationBuilder.DropIndex(
                name: "IX_Cities_SchoolApplicationId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "SchoolApplicationId",
                table: "Cities");

            migrationBuilder.RenameColumn(
                name: "AddressId",
                table: "SchoolApplications",
                newName: "SubBuildingNumber");

            migrationBuilder.RenameColumn(
                name: "Apartment",
                table: "Address",
                newName: "SubBuildingNumber");

            migrationBuilder.AlterColumn<int>(
                name: "CityId",
                table: "ZipCode",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "Established",
                table: "SchoolApplications",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "BuildingNumber",
                table: "SchoolApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "SchoolApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<List<string>>(
                name: "NearbyCities",
                table: "SchoolApplications",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "SchoolApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                table: "SchoolApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode");

            migrationBuilder.DropColumn(
                name: "BuildingNumber",
                table: "SchoolApplications");

            migrationBuilder.DropColumn(
                name: "City",
                table: "SchoolApplications");

            migrationBuilder.DropColumn(
                name: "NearbyCities",
                table: "SchoolApplications");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "SchoolApplications");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                table: "SchoolApplications");

            migrationBuilder.RenameColumn(
                name: "SubBuildingNumber",
                table: "SchoolApplications",
                newName: "AddressId");

            migrationBuilder.RenameColumn(
                name: "SubBuildingNumber",
                table: "Address",
                newName: "Apartment");

            migrationBuilder.AlterColumn<int>(
                name: "CityId",
                table: "ZipCode",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Established",
                table: "SchoolApplications",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<int>(
                name: "SchoolApplicationId",
                table: "Cities",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolApplications_AddressId",
                table: "SchoolApplications",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_SchoolApplicationId",
                table: "Cities",
                column: "SchoolApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cities_SchoolApplications_SchoolApplicationId",
                table: "Cities",
                column: "SchoolApplicationId",
                principalTable: "SchoolApplications",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolApplications_Address_AddressId",
                table: "SchoolApplications",
                column: "AddressId",
                principalTable: "Address",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id");
        }
    }
}
