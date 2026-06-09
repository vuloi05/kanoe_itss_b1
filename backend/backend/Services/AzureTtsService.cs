using backend.DTOs.Tts;
using Microsoft.CognitiveServices.Speech;

namespace backend.Services;

public class AzureTtsService : ITtsService
{
    private readonly IConfiguration _config;
    private readonly ILogger<AzureTtsService> _logger;

    public AzureTtsService(IConfiguration config, ILogger<AzureTtsService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<TtsSynthesizeResponseDto?> SynthesizeAsync(string text, string voice = "banmai")
    {
        try
        {
            var speechKey = _config["AZURE_SPEECH_KEY"] ?? Environment.GetEnvironmentVariable("AZURE_SPEECH_KEY");
            var speechRegion = _config["AZURE_SPEECH_REGION"] ?? Environment.GetEnvironmentVariable("AZURE_SPEECH_REGION");

            if (string.IsNullOrEmpty(speechKey) || string.IsNullOrEmpty(speechRegion))
            {
                _logger.LogWarning("Azure Speech credentials are not configured.");
                return null;
            }

            var speechConfig = SpeechConfig.FromSubscription(speechKey, speechRegion);

            // We do not output to default speaker. We just want the result in memory.
            using var synthesizer = new SpeechSynthesizer(speechConfig, null);
            
            var wordTimestamps = new List<WordTimestampDto>();

            // Subscribe to word boundary event
            synthesizer.WordBoundary += (s, e) =>
            {
                // e.AudioOffset is in ticks (10,000 ticks = 1 millisecond).
                // e.Duration is in ticks.
                var startMs = e.AudioOffset / 10000.0;
                var endMs = startMs + e.Duration.TotalMilliseconds;
                
                wordTimestamps.Add(new WordTimestampDto
                {
                    Word = e.Text,
                    Start = startMs,
                    End = endMs
                });
            };

            // Map FPT voices to Azure voices with pitch/rate adjustments to simulate 6 distinct voices
            var azureVoice = "vi-VN-HoaiMyNeural";
            var pitch = "default";
            var rate = "default";

            switch (voice.ToLower())
            {
                case "lannhi":
                    pitch = "-10%"; // slightly deeper female
                    break;
                case "thuminh":
                    pitch = "+10%"; // slightly higher female
                    break;
                case "giahan":
                    pitch = "+15%"; // high and fast female
                    rate = "+5%";
                    break;
                case "leminh":
                    azureVoice = "vi-VN-NamMinhNeural";
                    break;
                case "thientri":
                    azureVoice = "vi-VN-NamMinhNeural";
                    pitch = "-10%"; // deeper male
                    break;
                case "banmai":
                default:
                    break; // default female
            }

            var escapedText = System.Security.SecurityElement.Escape(text);
            var ssml = $@"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>
                            <voice name='{azureVoice}'>
                                <prosody pitch='{pitch}' rate='{rate}'>
                                    {escapedText}
                                </prosody>
                            </voice>
                          </speak>";

            var result = await synthesizer.SpeakSsmlAsync(ssml);

            if (result.Reason == ResultReason.SynthesizingAudioCompleted)
            {
                var audioBase64 = Convert.ToBase64String(result.AudioData);
                return new TtsSynthesizeResponseDto
                {
                    AudioBase64 = "data:audio/wav;base64," + audioBase64,
                    WordTimestamps = wordTimestamps
                };
            }
            else if (result.Reason == ResultReason.Canceled)
            {
                var cancellation = SpeechSynthesisCancellationDetails.FromResult(result);
                _logger.LogError("Azure TTS Canceled: {Reason}, ErrorCode: {ErrorCode}, Details: {Details}", 
                    cancellation.Reason, cancellation.ErrorCode, cancellation.ErrorDetails);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure TTS synthesis failed.");
            return null;
        }
    }
}
