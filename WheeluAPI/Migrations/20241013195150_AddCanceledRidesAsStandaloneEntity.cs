using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCanceledRidesAsStandaloneEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRide_AspNetUsers_CanceledById",
                table: "CanceledRide");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRide_AspNetUsers_StudentId",
                table: "CanceledRide");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRide_Courses_CourseId",
                table: "CanceledRide");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRide_SchoolInstructors_InstructorId",
                table: "CanceledRide");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRide_Vehicles_VehicleId",
                table: "CanceledRide");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CanceledRide",
                table: "CanceledRide");

            migrationBuilder.RenameTable(
                name: "CanceledRide",
                newName: "CanceledRides");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRide_VehicleId",
                table: "CanceledRides",
                newName: "IX_CanceledRides_VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRide_StudentId",
                table: "CanceledRides",
                newName: "IX_CanceledRides_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRide_InstructorId",
                table: "CanceledRides",
                newName: "IX_CanceledRides_InstructorId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRide_CourseId",
                table: "CanceledRides",
                newName: "IX_CanceledRides_CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRide_CanceledById",
                table: "CanceledRides",
                newName: "IX_CanceledRides_CanceledById");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CanceledRides",
                table: "CanceledRides",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 13, 19, 51, 50, 188, DateTimeKind.Utc).AddTicks(14));

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRides_AspNetUsers_CanceledById",
                table: "CanceledRides",
                column: "CanceledById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRides_AspNetUsers_StudentId",
                table: "CanceledRides",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRides_Courses_CourseId",
                table: "CanceledRides",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRides_SchoolInstructors_InstructorId",
                table: "CanceledRides",
                column: "InstructorId",
                principalTable: "SchoolInstructors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRides_Vehicles_VehicleId",
                table: "CanceledRides",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRides_AspNetUsers_CanceledById",
                table: "CanceledRides");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRides_AspNetUsers_StudentId",
                table: "CanceledRides");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRides_Courses_CourseId",
                table: "CanceledRides");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRides_SchoolInstructors_InstructorId",
                table: "CanceledRides");

            migrationBuilder.DropForeignKey(
                name: "FK_CanceledRides_Vehicles_VehicleId",
                table: "CanceledRides");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CanceledRides",
                table: "CanceledRides");

            migrationBuilder.RenameTable(
                name: "CanceledRides",
                newName: "CanceledRide");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRides_VehicleId",
                table: "CanceledRide",
                newName: "IX_CanceledRide_VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRides_StudentId",
                table: "CanceledRide",
                newName: "IX_CanceledRide_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRides_InstructorId",
                table: "CanceledRide",
                newName: "IX_CanceledRide_InstructorId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRides_CourseId",
                table: "CanceledRide",
                newName: "IX_CanceledRide_CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_CanceledRides_CanceledById",
                table: "CanceledRide",
                newName: "IX_CanceledRide_CanceledById");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CanceledRide",
                table: "CanceledRide",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 13, 14, 17, 39, 736, DateTimeKind.Utc).AddTicks(3412));

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRide_AspNetUsers_CanceledById",
                table: "CanceledRide",
                column: "CanceledById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRide_AspNetUsers_StudentId",
                table: "CanceledRide",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRide_Courses_CourseId",
                table: "CanceledRide",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRide_SchoolInstructors_InstructorId",
                table: "CanceledRide",
                column: "InstructorId",
                principalTable: "SchoolInstructors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CanceledRide_Vehicles_VehicleId",
                table: "CanceledRide",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
