using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class SmtpEmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _user;
    private readonly string _password;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(ILogger<SmtpEmailService> logger)
    {
        _logger = logger;

        _host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        _port = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587;
        _user = Environment.GetEnvironmentVariable("SMTP_USER")
            ?? throw new InvalidOperationException("SMTP_USER environment variable is not set.");
        _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD")
            ?? throw new InvalidOperationException("SMTP_PASSWORD environment variable is not set.");

        // Parse "Display Name <email>" format, fallback to plain email
        var fromRaw = Environment.GetEnvironmentVariable("SMTP_FROM") ?? _user;
        if (fromRaw.Contains('<') && fromRaw.Contains('>'))
        {
            _fromName = fromRaw[..fromRaw.IndexOf('<')].Trim();
            _fromAddress = fromRaw[(fromRaw.IndexOf('<') + 1)..fromRaw.IndexOf('>')].Trim();
        }
        else
        {
            _fromName = "VietImmerse";
            _fromAddress = fromRaw.Trim();
        }

        _logger.LogInformation(
            "SmtpEmailService initialized: Host={Host}, Port={Port}, User={User}, From={FromName} <{FromAddress}>",
            _host, _port, _user, _fromName, _fromAddress);
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation(
            "Preparing email to {To} with subject \"{Subject}\".", to, subject);

        using var message = new MailMessage
        {
            From = new MailAddress(_fromAddress, _fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(new MailAddress(to));

        using var client = new SmtpClient(_host, _port)
        {
            Credentials = new NetworkCredential(_user, _password),
            EnableSsl = true,
            // Prevent indefinite hang in containerized environments
            Timeout = 15_000,
        };

        _logger.LogInformation(
            "Connecting to SMTP {Host}:{Port} to send email to {To}...", _host, _port, to);

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {To}.", to);
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex,
                "SMTP error sending email to {To}. StatusCode={StatusCode}",
                to, ex.StatusCode);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected error sending email to {To}.", to);
            throw;
        }
    }
}
