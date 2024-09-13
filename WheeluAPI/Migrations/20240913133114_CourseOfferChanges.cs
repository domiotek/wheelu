using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class CourseOfferChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseOffers_CourseCategory_CategoryId",
                table: "CourseOffers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseCategory",
                table: "CourseCategory");

            migrationBuilder.RenameTable(
                name: "CourseCategory",
                newName: "CourseCategories");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseCategories",
                table: "CourseCategories",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 13, 31, 13, 795, DateTimeKind.Utc).AddTicks(5532));

            migrationBuilder.AddForeignKey(
                name: "FK_CourseOffers_CourseCategories_CategoryId",
                table: "CourseOffers",
                column: "CategoryId",
                principalTable: "CourseCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseOffers_CourseCategories_CategoryId",
                table: "CourseOffers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseCategories",
                table: "CourseCategories");

            migrationBuilder.RenameTable(
                name: "CourseCategories",
                newName: "CourseCategory");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseCategory",
                table: "CourseCategory",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "Images",
                keyColumn: "Id",
                keyValue: 1,
                column: "UploadDate",
                value: new DateTime(2024, 9, 13, 9, 15, 51, 641, DateTimeKind.Utc).AddTicks(6586));

            migrationBuilder.AddForeignKey(
                name: "FK_CourseOffers_CourseCategory_CategoryId",
                table: "CourseOffers",
                column: "CategoryId",
                principalTable: "CourseCategory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
