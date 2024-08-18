using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRejectionDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RejectionMessage",
                table: "SchoolApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RejectionReason",
                table: "SchoolApplications",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RejectionMessage",
                table: "SchoolApplications");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "SchoolApplications");
        }
    }
}
