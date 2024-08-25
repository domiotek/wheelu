using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class ALotOfStuff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Address_ZipCode_ZipCodeId",
                table: "Address");

            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Address_AddressId",
                table: "Schools");

            migrationBuilder.DropForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode");

            migrationBuilder.DropTable(
                name: "ActivationTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ZipCode",
                table: "ZipCode");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Address",
                table: "Address");

            migrationBuilder.RenameTable(
                name: "ZipCode",
                newName: "ZipCodes");

            migrationBuilder.RenameTable(
                name: "Address",
                newName: "Addresses");

            migrationBuilder.RenameIndex(
                name: "IX_ZipCode_CityId",
                table: "ZipCodes",
                newName: "IX_ZipCodes_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_Address_ZipCodeId",
                table: "Addresses",
                newName: "IX_Addresses_ZipCodeId");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "Established",
                table: "Schools",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Birthday",
                table: "AspNetUsers",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AlterColumn<int>(
                name: "SubBuildingNumber",
                table: "Addresses",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ZipCodes",
                table: "ZipCodes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AccountTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TokenType = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountTokens_UserId",
                table: "AccountTokens",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_ZipCodes_ZipCodeId",
                table: "Addresses",
                column: "ZipCodeId",
                principalTable: "ZipCodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Addresses_AddressId",
                table: "Schools",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ZipCodes_Cities_CityId",
                table: "ZipCodes",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_ZipCodes_ZipCodeId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Addresses_AddressId",
                table: "Schools");

            migrationBuilder.DropForeignKey(
                name: "FK_ZipCodes_Cities_CityId",
                table: "ZipCodes");

            migrationBuilder.DropTable(
                name: "AccountTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ZipCodes",
                table: "ZipCodes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "Birthday",
                table: "AspNetUsers");

            migrationBuilder.RenameTable(
                name: "ZipCodes",
                newName: "ZipCode");

            migrationBuilder.RenameTable(
                name: "Addresses",
                newName: "Address");

            migrationBuilder.RenameIndex(
                name: "IX_ZipCodes_CityId",
                table: "ZipCode",
                newName: "IX_ZipCode_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_Addresses_ZipCodeId",
                table: "Address",
                newName: "IX_Address_ZipCodeId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Established",
                table: "Schools",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<int>(
                name: "SubBuildingNumber",
                table: "Address",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ZipCode",
                table: "ZipCode",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Address",
                table: "Address",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ActivationTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivationTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivationTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivationTokens_UserId",
                table: "ActivationTokens",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Address_ZipCode_ZipCodeId",
                table: "Address",
                column: "ZipCodeId",
                principalTable: "ZipCode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Address_AddressId",
                table: "Schools",
                column: "AddressId",
                principalTable: "Address",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ZipCode_Cities_CityId",
                table: "ZipCode",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
