namespace backend.Services;

public interface ITranslationService
{
    /// <summary>
    /// Detect source language and translate to the other language.
    /// Vietnamese → Japanese, Japanese → Vietnamese.
    /// Returns null if translation fails.
    /// </summary>
    Task<string?> TranslateAsync(string text);
}
