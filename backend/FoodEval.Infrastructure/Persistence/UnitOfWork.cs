using FoodEval.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace FoodEval.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly FoodEvalDbContext _dbContext;

    public UnitOfWork(FoodEvalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task ExecuteInTransactionAsync(
        Func<CancellationToken, Task> action,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await action(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}

