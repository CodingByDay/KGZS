namespace FoodEval.Application.Interfaces;

/// <summary>
/// Unit of Work abstraction to coordinate transactions across repositories.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Executes the given action within a single database transaction.
    /// </summary>
    Task ExecuteInTransactionAsync(
        Func<CancellationToken, Task> action,
        CancellationToken cancellationToken = default);
}

