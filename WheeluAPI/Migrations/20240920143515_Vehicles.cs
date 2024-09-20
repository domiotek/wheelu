using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class Vehicles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VehiclePartTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    LifespanInDays = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehiclePartTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    ManufacturingYear = table.Column<int>(type: "integer", nullable: false),
                    Plate = table.Column<string>(type: "text", nullable: false),
                    CoverImageId = table.Column<int>(type: "integer", nullable: false),
                    LastInspection = table.Column<DateOnly>(type: "date", nullable: true),
                    Mileage = table.Column<int>(type: "integer", nullable: true),
                    MileageUpdateDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Power = table.Column<int>(type: "integer", nullable: true),
                    Displacement = table.Column<int>(type: "integer", nullable: true),
                    TransmissionSpeedCount = table.Column<int>(type: "integer", nullable: true),
                    TransmissionType = table.Column<int>(type: "integer", nullable: true),
                    AllowedIn = table.Column<int[]>(type: "integer[]", nullable: false),
                    Note = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Images_CoverImageId",
                        column: x => x.CoverImageId,
                        principalTable: "Images",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vehicles_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VehiclePartUsage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartId = table.Column<int>(type: "integer", nullable: false),
                    LastCheckDate = table.Column<DateOnly>(type: "date", nullable: true),
                    VehicleId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehiclePartUsage", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VehiclePartUsage_VehiclePartTypes_PartId",
                        column: x => x.PartId,
                        principalTable: "VehiclePartTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VehiclePartUsage_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 20, 14, 35, 13, 756, DateTimeKind.Utc).AddTicks(137));

            migrationBuilder.InsertData(
                table: "VehiclePartTypes",
                columns: new[] { "Id", "LifespanInDays" },
                values: new object[,]
                {
                    { 0, 1095 },
                    { 1, 365 },
                    { 2, 730 },
                    { 3, 730 },
                    { 4, 1825 },
                    { 5, 90 },
                    { 6, 1095 },
                    { 7, 1095 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_VehiclePartUsage_PartId",
                table: "VehiclePartUsage",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_VehiclePartUsage_VehicleId",
                table: "VehiclePartUsage",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CoverImageId",
                table: "Vehicles",
                column: "CoverImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_SchoolId",
                table: "Vehicles",
                column: "SchoolId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VehiclePartUsage");

            migrationBuilder.DropTable(
                name: "VehiclePartTypes");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 16, 11, 57, 52, 102, DateTimeKind.Utc).AddTicks(3146));
        }
    }
}
