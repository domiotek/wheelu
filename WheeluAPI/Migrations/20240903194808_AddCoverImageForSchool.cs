using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverImageForSchool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoverImageId",
                table: "Schools",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    UploadDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "FileName", "UploadDate" },
                values: new object[] { 1, "placeholder.png", new DateTime(2024, 9, 3, 19, 48, 7, 243, DateTimeKind.Utc).AddTicks(5765) });

            migrationBuilder.CreateIndex(
                name: "IX_Schools_CoverImageId",
                table: "Schools",
                column: "CoverImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Images_CoverImageId",
                table: "Schools",
                column: "CoverImageId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Images_CoverImageId",
                table: "Schools");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Schools_CoverImageId",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "Schools");
        }
    }
}
