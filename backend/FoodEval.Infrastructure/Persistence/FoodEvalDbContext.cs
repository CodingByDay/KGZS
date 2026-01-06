using FoodEval.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodEval.Infrastructure.Persistence;

public class FoodEvalDbContext : DbContext
{
    public FoodEvalDbContext(DbContextOptions<FoodEvalDbContext> options)
        : base(options)
    {
    }

    public DbSet<Applicant> Applicants { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Commission> Commissions { get; set; }
    public DbSet<CommissionMember> CommissionMembers { get; set; }
    public DbSet<ConsumerEvaluation> ConsumerEvaluations { get; set; }
    public DbSet<ConsumerEvaluationStation> ConsumerEvaluationStations { get; set; }
    public DbSet<CriterionEvaluation> CriterionEvaluations { get; set; }
    public DbSet<EvaluationCriterion> EvaluationCriteria { get; set; }
    public DbSet<EvaluationSession> EvaluationSessions { get; set; }
    public DbSet<EvaluationEvent> EvaluationEvents { get; set; }
    public DbSet<ExpertEvaluation> ExpertEvaluations { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<ProductSample> ProductSamples { get; set; }
    public DbSet<Protocol> Protocols { get; set; }
    public DbSet<ScoringPolicy> ScoringPolicies { get; set; }
    public DbSet<StructuredCommentTemplate> StructuredCommentTemplates { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Organization> Organizations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Money
        modelBuilder.Entity<Payment>()
            .Property(x => x.Amount)
            .HasPrecision(18, 2);

        // Scores (allow 0-100 with decimals, adjust if you need more)
        modelBuilder.Entity<ProductSample>()
            .Property(x => x.FinalScore)
            .HasPrecision(6, 2);

        modelBuilder.Entity<Protocol>()
            .Property(x => x.FinalScore)
            .HasPrecision(6, 2);

        modelBuilder.Entity<ExpertEvaluation>()
            .Property(x => x.FinalScore)
            .HasPrecision(6, 2);

        modelBuilder.Entity<ConsumerEvaluation>()
            .Property(x => x.Score)
            .HasPrecision(6, 2);

        // Weights (e.g. 0.00 - 9.99 or 0.0000 depending on your needs)
        modelBuilder.Entity<EvaluationCriterion>()
            .Property(x => x.Weight)
            .HasPrecision(6, 3);

        // UserType validation constraint (1 = GlobalAdmin, 2 = OrganizationAdmin, 3 = OrganizationUser, 4 = CommissionUser, 5 = InterestedParty)
        modelBuilder.Entity<User>()
            .ToTable(t => t.HasCheckConstraint("CK_Users_UserType", "UserType IN (1, 2, 3, 4, 5)"));
    }

}
