using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions");

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Transactions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "SchoolId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 10, 2, 10, 2, 51, 66, DateTimeKind.Utc).AddTicks(1945));

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_SchoolId",
                table: "Transactions",
                column: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Schools_SchoolId",
                table: "Transactions",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Schools_SchoolId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_SchoolId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "Transactions");

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Transactions",
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
                value: new DateTime(2024, 9, 29, 13, 34, 6, 322, DateTimeKind.Utc).AddTicks(8489));

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
