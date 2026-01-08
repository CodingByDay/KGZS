using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodEval.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEvaluationEventFromCommission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoryReviewers");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Commissions");

            migrationBuilder.DropColumn(
                name: "EvaluationEventId",
                table: "Commissions");

            migrationBuilder.CreateIndex(
                name: "IX_CommissionMembers_CommissionId",
                table: "CommissionMembers",
                column: "CommissionId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommissionMembers_Commissions_CommissionId",
                table: "CommissionMembers",
                column: "CommissionId",
                principalTable: "Commissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommissionMembers_Commissions_CommissionId",
                table: "CommissionMembers");

            migrationBuilder.DropIndex(
                name: "IX_CommissionMembers_CommissionId",
                table: "CommissionMembers");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Commissions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "EvaluationEventId",
                table: "Commissions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CategoryReviewers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsMainMemberOfGroup = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryReviewers", x => x.Id);
                });
        }
    }
}
