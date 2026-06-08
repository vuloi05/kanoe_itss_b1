using backend.DTOs.VoiceLab;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech.PronunciationAssessment;

namespace backend.Services;

public class AzurePronunciationService
{
    private readonly ILogger<AzurePronunciationService> _logger;
    private readonly string? _speechKey;
    private readonly string? _speechRegion;

    public AzurePronunciationService(IConfiguration config, ILogger<AzurePronunciationService> logger)
    {
        _logger = logger;
        _speechKey = config["AZURE_SPEECH_KEY"] ?? Environment.GetEnvironmentVariable("AZURE_SPEECH_KEY");
        _speechRegion = config["AZURE_SPEECH_REGION"] ?? Environment.GetEnvironmentVariable("AZURE_SPEECH_REGION");
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_speechKey) && !string.IsNullOrEmpty(_speechRegion);

    public async Task<(VoiceScoreResult? Scores, string? ActualText, List<AssessmentWordDto>? Words)> EvaluateAsync(Stream audioStream, string expectedText)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("Azure Speech is not configured.");
            return (null, null, null);
        }

        string tempFilePath = Path.GetTempFileName() + ".wav";
        try
        {
            var speechConfig = SpeechConfig.FromSubscription(_speechKey, _speechRegion);
            speechConfig.SpeechRecognitionLanguage = "vi-VN";

            await using (var fileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write))
            {
                if (audioStream.CanSeek) audioStream.Position = 0;
                await audioStream.CopyToAsync(fileStream);
            }

            using var audioConfig = AudioConfig.FromWavFileInput(tempFilePath);
            using var recognizer = new SpeechRecognizer(speechConfig, audioConfig);

            var pronunciationConfig = new PronunciationAssessmentConfig(
                expectedText,
                GradingSystem.HundredMark,
                Granularity.Word,
                true
            );
            
            pronunciationConfig.ApplyTo(recognizer);

            var result = await recognizer.RecognizeOnceAsync().ConfigureAwait(false);

            if (result == null || result.Reason != ResultReason.RecognizedSpeech)
            {
                _logger.LogWarning("Azure Speech did not recognize speech. Reason: {Reason}", result?.Reason);
                return (null, null, null);
            }

            var pronResult = PronunciationAssessmentResult.FromResult(result);
            if (pronResult == null)
            {
                _logger.LogWarning("PronunciationAssessmentResult is null.");
                return (null, null, null);
            }

            var scores = new VoiceScoreResult
            {
                Accuracy = pronResult.AccuracyScore,
                Completeness = pronResult.CompletenessScore,
                Fluency = pronResult.FluencyScore,
                Prosody = pronResult.PronunciationScore 
            };

            var words = new List<AssessmentWordDto>();
            foreach (var word in pronResult.Words)
            {
                words.Add(new AssessmentWordDto
                {
                    Word = word.Word,
                    ErrorType = word.ErrorType
                });
            }

            return (scores, result.Text, words);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure Pronunciation Service failed.");
            return (null, null, null);
        }
        finally
        {
            try { if (File.Exists(tempFilePath)) File.Delete(tempFilePath); } catch { }
        }
    }
}
