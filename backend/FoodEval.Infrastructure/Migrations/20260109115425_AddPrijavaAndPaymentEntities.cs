using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodEval.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrijavaAndPaymentEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Prijave",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReviewDueDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prijave", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prijave_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prijave_Products_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrijavaPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PrijavaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentStatus = table.Column<int>(type: "int", nullable: false),
                    ProviderSessionId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentIntentId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankTransferReceiptUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdminConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AdminConfirmedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrijavaPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrijavaPayments_Prijave_PrijavaId",
                        column: x => x.PrijavaId,
                        principalTable: "Prijave",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrijavaPayments_Users_AdminConfirmedByUserId",
                        column: x => x.AdminConfirmedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrijavaPayments_AdminConfirmedByUserId",
                table: "PrijavaPayments",
                column: "AdminConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PrijavaPayments_PrijavaId",
                table: "PrijavaPayments",
                column: "PrijavaId");

            migrationBuilder.CreateIndex(
                name: "IX_Prijave_ItemId",
                table: "Prijave",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Prijave_OrganizationId",
                table: "Prijave",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrijavaPayments");

            migrationBuilder.DropTable(
                name: "Prijave");
        }
    }
}
