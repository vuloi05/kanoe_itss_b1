using System.Security.Cryptography;
using System.Text;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Reads SQL seed files from disk and executes them idempotently.
/// Tracks file hashes in _seed_history to skip unchanged files.
/// </summary>
public static class DatabaseSeeder
{
    private const string HistoryTable = "_seed_history";

    public static async Task SeedAsync(VietImmerseDbContext context, ILogger logger)
    {
        var sqlDir = ResolveSqlDirectory();
        if (sqlDir == null)
        {
            logger.LogWarning("Database seed directory not found — skipping seed");
            return;
        }

        var seedFile = Path.Combine(sqlDir, "seed_data.sql");
        if (!File.Exists(seedFile))
        {
            logger.LogWarning("seed_data.sql not found at {Path} — skipping seed", seedFile);
            return;
        }

        await EnsureHistoryTableAsync(context);

        var sql = await File.ReadAllTextAsync(seedFile);
        var hash = ComputeSha256(sql);

        if (await IsAlreadyAppliedAsync(context, "seed_data.sql", hash))
        {
            logger.LogInformation("🌱 Seed data unchanged (hash match) — skipping");
            return;
        }

        logger.LogInformation("🌱 Applying seed_data.sql (hash: {Hash})…", hash[..12]);

        try
        {
            // Use raw ADO.NET to avoid EF Core parsing `{` in JSON as format placeholders
            var connection = context.Database.GetDbConnection();
            await connection.OpenAsync();
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.CommandTimeout = 120;
            await command.ExecuteNonQueryAsync();

            await RecordAppliedAsync(context, "seed_data.sql", hash);
            logger.LogInformation("✅ Seed data applied successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Failed to apply seed_data.sql");
            throw;
        }
    }

    // Walk up from working directory to find the database/ folder
    private static string? ResolveSqlDirectory()
    {
        // Published output: database/ sits next to the DLL
        var appDir = AppContext.BaseDirectory;
        var candidate = Path.Combine(appDir, "database");
        if (Directory.Exists(candidate)) return candidate;

        // Dev: working dir is backend/backend/, try relative paths
        var cwd = Directory.GetCurrentDirectory();
        candidate = Path.Combine(cwd, "database");
        if (Directory.Exists(candidate)) return candidate;

        // Fallback: search up to 4 parent levels
        var dir = new DirectoryInfo(cwd);
        for (int i = 0; i < 4 && dir != null; i++)
        {
            candidate = Path.Combine(dir.FullName, "database");
            if (Directory.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }

        return null;
    }

    private static string ComputeSha256(string content)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(content));
        return Convert.ToHexStringLower(bytes);
    }

    private static async Task EnsureHistoryTableAsync(VietImmerseDbContext context)
    {
        var sql = "CREATE TABLE IF NOT EXISTS " + HistoryTable + " (" +
            "id SERIAL PRIMARY KEY, " +
            "file_name VARCHAR(255) NOT NULL, " +
            "hash VARCHAR(64) NOT NULL, " +
            "applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())";
        await context.Database.ExecuteSqlRawAsync(sql);
    }

    private static async Task<bool> IsAlreadyAppliedAsync(
        VietImmerseDbContext context, string fileName, string hash)
    {
        // EF Core's SqlQueryRaw<int> expects column named "Value"
        var sql = "SELECT COUNT(*)::int AS \"Value\" FROM " + HistoryTable +
            " WHERE file_name = {0} AND hash = {1}" +
            " AND id = (SELECT MAX(id) FROM " + HistoryTable + " WHERE file_name = {0})";

        var count = await context.Database
            .SqlQueryRaw<int>(sql, fileName, hash)
            .FirstOrDefaultAsync();

        return count > 0;
    }

    private static async Task RecordAppliedAsync(
        VietImmerseDbContext context, string fileName, string hash)
    {
        var sql = "INSERT INTO " + HistoryTable + " (file_name, hash, applied_at) VALUES ({0}, {1}, NOW())";
        await context.Database.ExecuteSqlRawAsync(sql, fileName, hash);
    }
}
