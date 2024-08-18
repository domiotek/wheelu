using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheeluAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "State",
                table: "SchoolApplications",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "SchoolApplications",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "SchoolApplications");

            migrationBuilder.AlterColumn<int>(
                name: "State",
                table: "SchoolApplications",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
