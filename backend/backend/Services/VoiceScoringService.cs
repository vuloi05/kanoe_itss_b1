using System.Globalization;
using System.Text;

namespace backend.Services;

/// <summary>
/// Real pronunciation scoring using mathematical algorithms.
/// NO Random values — every score is deterministically derived from input text comparison.
/// </summary>
public class VoiceScoringService : IVoiceScoringService
{
    // Average Vietnamese speaking speed (words per second)
    private const double StandardWordsPerSecond = 2.5;

    // Vietnamese tone marks mapped to their tone category
    private static readonly Dictionary<char, int> ToneMap = BuildToneMap();

    public VoiceScoreResult CalculateScores(string expectedText, string actualText, double durationSeconds)
    {
        var expected = NormalizeText(expectedText);
        var actual = NormalizeText(actualText);

        return new VoiceScoreResult
        {
            Completeness = CalculateCompleteness(expected, actual),
            Accuracy = CalculateAccuracy(expected, actual),
            Fluency = CalculateFluency(expected, durationSeconds),
            Prosody = CalculateProsody(expected, actual)
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // COMPLETENESS: What fraction of expected words appear in actual?
    // ═══════════════════════════════════════════════════════════════════
    private static double CalculateCompleteness(string expected, string actual)
    {
        var expectedWords = Tokenize(expected);
        if (expectedWords.Length == 0) return 100.0;

        var actualWords = new HashSet<string>(Tokenize(actual), StringComparer.OrdinalIgnoreCase);
        var matchCount = expectedWords.Count(w => actualWords.Contains(w));

        return Math.Round((double)matchCount / expectedWords.Length * 100, 2);
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACCURACY: Character-level Levenshtein distance similarity
    // ═══════════════════════════════════════════════════════════════════
    private static double CalculateAccuracy(string expected, string actual)
    {
        if (expected.Length == 0 && actual.Length == 0) return 100.0;

        var distance = LevenshteinDistance(expected, actual);
        var maxLen = Math.Max(expected.Length, actual.Length);

        return Math.Round(Math.Max(0, 100.0 - ((double)distance / maxLen * 100)), 2);
    }

    /// <summary>
    /// Wagner-Fischer dynamic programming algorithm for edit distance.
    /// Uses O(min(m,n)) space optimization.
    /// </summary>
    private static int LevenshteinDistance(string s, string t)
    {
        var sLen = s.Length;
        var tLen = t.Length;

        if (sLen == 0) return tLen;
        if (tLen == 0) return sLen;

        // Ensure s is the shorter string for space optimization
        if (sLen > tLen)
        {
            (s, t) = (t, s);
            (sLen, tLen) = (tLen, sLen);
        }

        var prev = new int[sLen + 1];
        var curr = new int[sLen + 1];

        for (var i = 0; i <= sLen; i++)
            prev[i] = i;

        for (var j = 1; j <= tLen; j++)
        {
            curr[0] = j;
            for (var i = 1; i <= sLen; i++)
            {
                var cost = s[i - 1] == t[j - 1] ? 0 : 1;
                curr[i] = Math.Min(
                    Math.Min(curr[i - 1] + 1, prev[i] + 1),
                    prev[i - 1] + cost);
            }
            (prev, curr) = (curr, prev);
        }

        return prev[sLen];
    }

    // ═══════════════════════════════════════════════════════════════════
    // FLUENCY: How close is the speaking speed to native tempo?
    // Uses grace period + absolute deduction + floor score for fairness.
    // ═══════════════════════════════════════════════════════════════════

    // Hardware/human latency buffer (button press, inhale, etc.)
    private const double GracePeriodSeconds = 1.5;
    // Points deducted per second of deviation beyond the grace window
    private const double PenaltyPerSecond = 12.0;
    // Minimum score when user actually produced speech
    private const double FloorScore = 40.0;

    private static double CalculateFluency(string expected, double durationSeconds)
    {
        var wordCount = Tokenize(expected).Length;
        if (wordCount == 0 || durationSeconds <= 0) return 0.0;

        var expectedDuration = (wordCount / StandardWordsPerSecond) + GracePeriodSeconds;
        var deviation = Math.Max(0, Math.Abs(durationSeconds - expectedDuration));

        var score = Math.Max(FloorScore, 100.0 - (deviation * PenaltyPerSecond));
        return Math.Round(score, 2);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PROSODY: Vietnamese tone mark comparison
    // Extracts diacritical tone from each word, compares sequences
    // ═══════════════════════════════════════════════════════════════════
    private static double CalculateProsody(string expected, string actual)
    {
        var expectedTones = ExtractTones(expected);
        var actualTones = ExtractTones(actual);

        if (expectedTones.Length == 0) return 100.0;

        var matchCount = 0;
        var compareLen = Math.Min(expectedTones.Length, actualTones.Length);

        for (var i = 0; i < compareLen; i++)
        {
            if (expectedTones[i] == actualTones[i])
                matchCount++;
        }

        return Math.Round((double)matchCount / expectedTones.Length * 100, 2);
    }

    /// <summary>
    /// Extract the tone (dấu thanh) of each word in the text.
    /// Returns an array of tone IDs: 0=ngang, 1=sắc, 2=huyền, 3=hỏi, 4=ngã, 5=nặng
    /// </summary>
    private static int[] ExtractTones(string text)
    {
        var words = Tokenize(text);
        var tones = new int[words.Length];

        for (var i = 0; i < words.Length; i++)
        {
            tones[i] = GetWordTone(words[i]);
        }

        return tones;
    }

    /// <summary>
    /// Determine the tone of a Vietnamese word by scanning its characters
    /// for diacritical marks.
    /// </summary>
    private static int GetWordTone(string word)
    {
        foreach (var ch in word)
        {
            if (ToneMap.TryGetValue(ch, out var tone))
                return tone;
        }
        // No diacritical mark found → thanh ngang (flat tone)
        return 0;
    }

    /// <summary>
    /// Build a lookup table mapping Vietnamese vowels with tone marks
    /// to their tone category ID.
    /// </summary>
    private static Dictionary<char, int> BuildToneMap()
    {
        var map = new Dictionary<char, int>();

        // Tone 1: Sắc (acute accent)
        foreach (var c in "áắấéếíóốớúứý")
            map[c] = 1;

        // Tone 2: Huyền (grave accent)
        foreach (var c in "àằầèềìòồờùừỳ")
            map[c] = 2;

        // Tone 3: Hỏi (hook above)
        foreach (var c in "ảẳẩẻểỉỏổởủửỷ")
            map[c] = 3;

        // Tone 4: Ngã (tilde)
        foreach (var c in "ãẵẫẽễĩõỗỡũữỹ")
            map[c] = 4;

        // Tone 5: Nặng (dot below)
        foreach (var c in "ạặậẹệịọộợụựỵ")
            map[c] = 5;

        return map;
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════

    private static string NormalizeText(string text)
    {
        return text.Trim().ToLowerInvariant();
    }

    private static string[] Tokenize(string text)
    {
        return text.Split(new[] { ' ', '\t', '\n', '\r', ',', '.', '!', '?', ';', ':' },
            StringSplitOptions.RemoveEmptyEntries);
    }
}
