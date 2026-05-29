using System.Security.Cryptography;
using System.Text;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Services;

/// <summary>
/// Executes schema.sql and seed_data.sql idempotently on startup.
/// Tracks SHA-256 hashes in _seed_history — re-executes only when file content changes.
/// Auto-recovers from missing-table errors (42P01) by force-running schema.sql.
/// </summary>
public static class DatabaseSeeder
{
    private const string HistoryTable = "_seed_history";

    public static async Task SeedAsync(VietImmerseDbContext context, ILogger logger)
    {
        var sqlDir = ResolveSqlDirectory();
        if (sqlDir == null)
        {
            logger.LogWarning("Database seed directory not found — skipping");
            return;
        }

        await EnsureHistoryTableAsync(context);

        // ── Phase 1: Apply schema.sql (DDL — CREATE TABLE IF NOT EXISTS) ──
        var schemaFile = Path.Combine(sqlDir, "schema.sql");
        if (File.Exists(schemaFile))
        {
            await ApplyFileIfChangedAsync(context, logger, schemaFile, "schema.sql");
        }
        else
        {
            logger.LogWarning("schema.sql not found at {Path} — skipping DDL", schemaFile);
        }

        // ── Phase 2: Apply seed_data.sql (DML — INSERT ... ON CONFLICT) ──
        var seedFile = Path.Combine(sqlDir, "seed_data.sql");
        if (!File.Exists(seedFile))
        {
            logger.LogWarning("seed_data.sql not found at {Path} — skipping seed", seedFile);
            return;
        }

        try
        {
            await ApplyFileIfChangedAsync(context, logger, seedFile, "seed_data.sql");
        }
        catch (PostgresException ex) when (ex.SqlState == "42P01")
        {
            // Missing table — schema.sql was likely not applied or is stale
            logger.LogError(ex,
                "❌ Phát hiện thiếu bảng (42P01: {Table}). Đang force-run lại schema.sql...",
                ex.MessageText);

            if (File.Exists(schemaFile))
            {
                await ForceApplyFileAsync(context, logger, schemaFile, "schema.sql");

                // Retry seed_data.sql after schema recovery
                logger.LogInformation("🔄 Retrying seed_data.sql after schema recovery...");
                await ForceApplyFileAsync(context, logger, seedFile, "seed_data.sql");
            }
            else
            {
                logger.LogError("schema.sql not found — cannot auto-recover from missing tables");
                throw;
            }
        }

        // ── Phase 2.1: Apply seed_data_part2.sql (V1 dialogues Ch4-8, voice lab, progress) ──
        var seedPart2File = Path.Combine(sqlDir, "seed_data_part2.sql");
        if (File.Exists(seedPart2File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedPart2File, "seed_data_part2.sql");
        }

        // ── Phase 2.5: Apply seed_data_v1_extra.sql (V1 extended lessons 4-7) ──
        var seedV1ExtraFile = Path.Combine(sqlDir, "seed_data_v1_extra.sql");
        if (File.Exists(seedV1ExtraFile))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV1ExtraFile, "seed_data_v1_extra.sql");
        }

        // ── Phase 2.6: Apply seed_data_v1_extra_part2.sql (V1 extended L4-7, Ch5-8) ──
        var seedV1ExtraPart2File = Path.Combine(sqlDir, "seed_data_v1_extra_part2.sql");
        if (File.Exists(seedV1ExtraPart2File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV1ExtraPart2File, "seed_data_v1_extra_part2.sql");
        }

        // ── Phase 3: Apply seed_data_v2.sql (V2 content — runs after V1) ──
        var seedV2File = Path.Combine(sqlDir, "seed_data_v2.sql");
        if (File.Exists(seedV2File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV2File, "seed_data_v2.sql");
        }

        // ── Phase 3.5: Apply seed_data_v2_extra.sql (V2 extended lessons 4-7) ──
        var seedV2ExtraFile = Path.Combine(sqlDir, "seed_data_v2_extra.sql");
        if (File.Exists(seedV2ExtraFile))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV2ExtraFile, "seed_data_v2_extra.sql");
        }

        // ── Phase 4: Apply seed_data_v3.sql (V3 content — runs after V2) ──
        var seedV3File = Path.Combine(sqlDir, "seed_data_v3.sql");
        if (File.Exists(seedV3File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV3File, "seed_data_v3.sql");
        }

        // ── Phase 4.1: Apply seed_data_v3_part2.sql (V3 dialogues Ch20-24) ──
        var seedV3Part2File = Path.Combine(sqlDir, "seed_data_v3_part2.sql");
        if (File.Exists(seedV3Part2File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV3Part2File, "seed_data_v3_part2.sql");
        }

        // ── Phase 4.5: Apply seed_data_v3_extra.sql (V3 extended lessons 4-7) ──
        var seedV3ExtraFile = Path.Combine(sqlDir, "seed_data_v3_extra.sql");
        if (File.Exists(seedV3ExtraFile))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV3ExtraFile, "seed_data_v3_extra.sql");
        }

        // ── Phase 4.6: Apply seed_data_v3_extra_part2.sql (V3 extra dialogues Ch21-24) ──
        var seedV3ExtraPart2File = Path.Combine(sqlDir, "seed_data_v3_extra_part2.sql");
        if (File.Exists(seedV3ExtraPart2File))
        {
            await ApplyFileIfChangedAsync(context, logger, seedV3ExtraPart2File, "seed_data_v3_extra_part2.sql");
        }

        // ── Phase 5: Fix invalid progress data for abc@gmail.com (V2 Ch10-16) ──
        var fixProgressV2AbcFile = Path.Combine(sqlDir, "fix_progress_v2_abc.sql");
        if (File.Exists(fixProgressV2AbcFile))
        {
            await ApplyFileIfChangedAsync(context, logger, fixProgressV2AbcFile, "fix_progress_v2_abc.sql");
        }
    }

    /// <summary>
    /// Compare current file hash against the latest recorded hash in _seed_history.
    /// Only executes the SQL if the hash has changed (file was modified).
    /// </summary>
    private static async Task ApplyFileIfChangedAsync(
        VietImmerseDbContext context, ILogger logger, string filePath, string fileName)
    {
        var sql = await File.ReadAllTextAsync(filePath);
        var hash = ComputeSha256(sql);

        if (await IsLatestHashMatchAsync(context, fileName, hash))
        {
            logger.LogInformation("🌱 {File} unchanged (hash match) — skipping", fileName);
            return;
        }

        logger.LogInformation("🌱 Applying {File} (hash: {Hash})…", fileName, hash[..12]);
        await ExecuteSqlAsync(context, sql);
        await RecordAppliedAsync(context, fileName, hash);
        logger.LogInformation("✅ {File} applied successfully", fileName);
    }

    /// <summary>
    /// Force-execute a SQL file regardless of hash history.
    /// Used for auto-recovery after missing-table errors.
    /// </summary>
    private static async Task ForceApplyFileAsync(
        VietImmerseDbContext context, ILogger logger, string filePath, string fileName)
    {
        var sql = await File.ReadAllTextAsync(filePath);
        var hash = ComputeSha256(sql);

        logger.LogInformation("🔧 Force-applying {File} (hash: {Hash})…", fileName, hash[..12]);
        await ExecuteSqlAsync(context, sql);
        await RecordAppliedAsync(context, fileName, hash);
        logger.LogInformation("✅ {File} force-applied successfully", fileName);
    }

    /// <summary>
    /// Execute raw SQL via ADO.NET to avoid EF Core's format-string parsing
    /// (which chokes on `{` characters inside JSON literals).
    /// </summary>
    private static async Task ExecuteSqlAsync(VietImmerseDbContext context, string sql)
    {
        var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.CommandTimeout = 120;
        await command.ExecuteNonQueryAsync();
    }

    // ═══════════════════════════════════════════════════════════════════
    // Infrastructure helpers
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Walk up from working directory / app base to find the database/ folder.
    /// </summary>
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

    /// <summary>
    /// Check if the LATEST history entry for this file matches the given hash.
    /// Returns true only when the most recent record's hash equals the current file hash.
    /// </summary>
    private static async Task<bool> IsLatestHashMatchAsync(
        VietImmerseDbContext context, string fileName, string hash)
    {
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
