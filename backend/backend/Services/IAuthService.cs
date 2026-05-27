using backend.DTOs.Auth;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterLearnerAsync(RegisterLearnerRequest request);
    Task<AuthResponse> RegisterPartnerAsync(RegisterPartnerRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<string> VerifyOtpAsync(VerifyOtpRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<UserProfileResponse> GetProfileAsync(Guid userId);
}
