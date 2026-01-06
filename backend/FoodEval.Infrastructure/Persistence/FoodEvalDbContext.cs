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
    public DbSet<Event> Events { get; set; }
    public DbSet<ExpertEvaluation> ExpertEvaluations { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<ProductSample> ProductSamples { get; set; }
    public DbSet<Record> Records { get; set; }
    public DbSet<ScoringPolicy> ScoringPolicies { get; set; }
    public DbSet<StructuredCommentTemplate> StructuredCommentTemplates { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
