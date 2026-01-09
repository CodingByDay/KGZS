using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodEval.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMidNumberUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MidNumber",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_MidNumber",
                table: "Organizations",
                column: "MidNumber",
                unique: true,
                filter: "[IsActive] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Organizations_MidNumber",
                table: "Organizations");

            migrationBuilder.AlterColumn<string>(
                name: "MidNumber",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
