using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodEval.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationAndUserType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "Records");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "StructuredCommentTemplates",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "ScoringPolicies",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "ProductSamples",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Payments",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "EvaluationCriteria",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "ConsumerEvaluationStations",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "ConsumerEvaluations",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Commissions",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Categories",
                newName: "EvaluationEventId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Applicants",
                newName: "EvaluationEventId");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserType",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 1); // Default to GlobalAdmin (1) for existing users

            // Update existing SuperAdmin users to have UserType = GlobalAdmin and OrganizationId = null
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET UserType = 1, OrganizationId = NULL 
                WHERE PrimaryRole = 0 AND UserType = 0
            ");

            // Add CHECK constraint to validate UserType values (1-5)
            migrationBuilder.Sql(@"
                ALTER TABLE Users
                ADD CONSTRAINT CK_Users_UserType 
                CHECK (UserType IN (1, 2, 3, 4, 5))
            ");

            migrationBuilder.CreateTable(
                name: "EvaluationEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentRequired = table.Column<bool>(type: "bit", nullable: false),
                    AllowConsumerEvaluation = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Village = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Protocols",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluationEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductSampleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProtocolNumber = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    PreviousVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FinalScore = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    GeneratedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AcknowledgedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PDFPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VersionCreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    VersionCreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Protocols", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EvaluationEvents");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropTable(
                name: "Protocols");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserType",
                table: "Users");

            // Drop CHECK constraint
            migrationBuilder.Sql(@"
                ALTER TABLE Users
                DROP CONSTRAINT IF EXISTS CK_Users_UserType
            ");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "StructuredCommentTemplates",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "ScoringPolicies",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "ProductSamples",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "Payments",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "EvaluationCriteria",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "ConsumerEvaluationStations",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "ConsumerEvaluations",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "Commissions",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "Categories",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "EvaluationEventId",
                table: "Applicants",
                newName: "EventId");

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowConsumerEvaluation = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EndDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentRequired = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Records",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AcknowledgedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApplicantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FinalScore = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    GeneratedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PDFPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviousVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductSampleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecordNumber = table.Column<int>(type: "int", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    VersionCreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    VersionCreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Records", x => x.Id);
                });
        }
    }
}
